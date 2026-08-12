"""
Content Variant Generators (LLM and Mock implementations).
Translates diagnostic action plans into immutable ContentVariants.
"""

from abc import ABC, abstractmethod
import json
import re
from typing import Any, Dict, List, Optional
import uuid

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content
from virality_lab.llm.base import LLMProvider
from virality_lab.optimizer.diagnostics_mapper import DiagnosticActionPlan
from virality_lab.optimizer.schemas import ContentVariant, OptimizationObjective, OptimizationTarget
from virality_lab.optimizer.strategies import (
    BaseOptimizationStrategy,
    CaptionOptimizationStrategy,
    CTAOptimizationStrategy,
    HookOptimizationStrategy,
    ShareabilityOptimizationStrategy,
    StructureOptimizationStrategy,
)
from virality_lab.scoring.schemas import ViralityScore


class BaseContentOptimizer(ABC):
    """Abstract base class for content variant generators."""

    @abstractmethod
    def generate_variants(
        self,
        content: Content,
        score: ViralityScore,
        plans: List[DiagnosticActionPlan],
        num_variants: int = 3,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
        profile: Optional[ContentProfile] = None,
    ) -> List[ContentVariant]:
        """Generate N targeted content variants based on diagnostic action plans."""
        pass


class LLMContentOptimizer(BaseContentOptimizer):
    """
    LLM-powered optimizer using registered strategies and LLMProvider to generate variants.
    """

    def __init__(self, provider: LLMProvider, strategies: Optional[List[BaseOptimizationStrategy]] = None) -> None:
        self.provider = provider
        self.strategies: Dict[OptimizationTarget, BaseOptimizationStrategy] = {}

        default_strategies: List[BaseOptimizationStrategy] = strategies or [
            HookOptimizationStrategy(),
            CaptionOptimizationStrategy(),
            StructureOptimizationStrategy(),
            CTAOptimizationStrategy(),
            ShareabilityOptimizationStrategy(),
        ]
        for strat in default_strategies:
            self.strategies[strat.target] = strat

    def generate_variants(
        self,
        content: Content,
        score: ViralityScore,
        plans: List[DiagnosticActionPlan],
        num_variants: int = 3,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
        profile: Optional[ContentProfile] = None,
    ) -> List[ContentVariant]:
        variants: List[ContentVariant] = []

        # Allocate variants across top plans
        plans_to_use = plans[:num_variants] if plans else []
        if not plans_to_use:
            return variants

        # Distribute variant quota
        idx = 0
        while len(variants) < num_variants and idx < len(plans_to_use) * 2:
            plan = plans_to_use[idx % len(plans_to_use)]
            strategy = self.strategies.get(plan.target, self.strategies.get(OptimizationTarget.HOOK))
            idx += 1

            if not strategy or not strategy.can_handle(content):
                continue

            variant_id = f"var-{plan.target.value[:4]}-{len(variants) + 1}-{uuid.uuid4().hex[:4]}"
            system_prompt, user_prompt = strategy.build_prompt(
                content=content,
                score=score,
                plan=plan,
                profile=profile,
                objective=objective,
            )

            try:
                llm_resp = self.provider.generate(system_prompt=system_prompt, user_prompt=user_prompt)
                parsed = self._parse_json_response(llm_resp.content)

                new_caption = parsed.get("full_caption", content.caption)
                new_transcript = parsed.get("full_transcript", content.transcript)
                changes = [parsed.get("change_summary", f"Optimized {plan.target.value}")]
                reason = parsed.get("rationale", plan.evidence)

                # Construct immutable new Content object
                new_content = content.model_copy(
                    update={
                        "id": f"{content.id}_{variant_id}",
                        "caption": new_caption,
                        "transcript": new_transcript,
                        "metadata": {**content.metadata, "variant_id": variant_id, "optimization_target": plan.target.value},
                    }
                )

                variant = strategy.create_variant(
                    original_content=content,
                    variant_id=variant_id,
                    modified_content=new_content,
                    changes=changes,
                    reason=reason,
                    target_metric=plan.target_metric,
                )
                variants.append(variant)
            except Exception as exc:
                # Graceful fallback to deterministic template if LLM fails
                fallback_variant = self._generate_fallback_variant(content, plan, strategy, variant_id)
                variants.append(fallback_variant)

        return variants[:num_variants]

    def _parse_json_response(self, raw_text: str) -> Dict[str, Any]:
        """Safely parse LLM output extracting JSON."""
        clean = raw_text.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```(?:json)?\n", "", clean)
            clean = re.sub(r"\n```$", "", clean)

        try:
            return json.loads(clean)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", clean, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise ValueError(f"Could not parse JSON from LLM response: {raw_text[:100]}...")

    def _generate_fallback_variant(
        self,
        content: Content,
        plan: DiagnosticActionPlan,
        strategy: BaseOptimizationStrategy,
        variant_id: str,
    ) -> ContentVariant:
        """Deterministic fallback variant generation when LLM is unreachable."""
        target = plan.target
        new_caption = content.caption
        new_transcript = content.transcript
        change_desc = f"Applied rule-based {target.value} optimization"

        if target == OptimizationTarget.HOOK:
            prefix = "Wait until you see how "
            new_caption = f"{prefix}{content.caption[0].lower() + content.caption[1:]}" if content.caption else prefix
            if new_transcript:
                new_transcript = f"{prefix}{content.transcript}"
            change_desc = "Replaced opening with high-curiosity hook framing"
        elif target == OptimizationTarget.SHAREABILITY:
            new_caption = f"{content.caption}\n\nShare this with someone who needs this workflow!"
            change_desc = "Added peer-sharing prompt and group utility framing"
        elif target == OptimizationTarget.CAPTION:
            new_caption = f"{content.caption}\n\nKey Breakdown:\n- Step 1: Save time\n- Step 2: Scale output\nSave for reference!"
            change_desc = "Structured caption with bulleted summary and bookmark prompt"
        elif target == OptimizationTarget.CTA:
            new_caption = f"{content.caption}\n\nFollow for more daily AI workflows."
            change_desc = "Added clear creator follow value proposition"

        new_content = content.model_copy(
            update={
                "id": f"{content.id}_{variant_id}",
                "caption": new_caption,
                "transcript": new_transcript,
                "metadata": {**content.metadata, "variant_id": variant_id, "optimization_target": target.value},
            }
        )

        return strategy.create_variant(
            original_content=content,
            variant_id=variant_id,
            modified_content=new_content,
            changes=[change_desc],
            reason=plan.evidence,
            target_metric=plan.target_metric,
        )


class MockContentOptimizer(BaseContentOptimizer):
    """
    Deterministic mock content optimizer for zero-dependency offline testing.
    Generates realistic, distinct variants without external API calls.
    """

    def generate_variants(
        self,
        content: Content,
        score: ViralityScore,
        plans: List[DiagnosticActionPlan],
        num_variants: int = 3,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
        profile: Optional[ContentProfile] = None,
    ) -> List[ContentVariant]:
        variants: List[ContentVariant] = []

        templates = [
            (
                OptimizationTarget.HOOK,
                "HookOptimizationStrategy",
                "Still doing this manually in 2026? " + content.caption,
                ["Replaced opening with high-contrast curiosity question."],
                "Low stop-scroll scores across casual and student personas.",
                "stop_scroll",
            ),
            (
                OptimizationTarget.SHAREABILITY,
                "ShareabilityOptimizationStrategy",
                content.caption + " Send this to your study group before finals!",
                ["Added social currency and peer forwarding context."],
                "Low share probability across broad audience segments.",
                "share_probability",
            ),
            (
                OptimizationTarget.STRUCTURE,
                "StructureOptimizationStrategy",
                "Here is the exact 3-step AI stack to cut 4 hours daily: " + content.caption,
                ["Front-loaded the immediate payoff in the opening 2 seconds."],
                "High mid-video drop-off before narrative payoff.",
                "completion_probability",
            ),
            (
                OptimizationTarget.CAPTION,
                "CaptionOptimizationStrategy",
                content.caption + "\n\nQuick Checklist:\n1. Automate drafts\n2. Batch research\nSave for later!",
                ["Structured caption with bulleted utility checklist and save prompt."],
                "Low save rate and bookmark utility.",
                "save_probability",
            ),
        ]

        for i in range(min(num_variants, len(templates))):
            target, strat_name, new_caption, changes, reason, target_metric = templates[i]
            vid = f"mock-var-{i + 1:02d}"
            new_content = content.model_copy(
                update={
                    "id": f"{content.id}_{vid}",
                    "caption": new_caption,
                    "metadata": {**content.metadata, "variant_id": vid, "target": target.value},
                }
            )
            variant = ContentVariant(
                variant_id=vid,
                parent_content_id=content.id,
                optimization_target=target,
                strategy_name=strat_name,
                changes=changes,
                reason=reason,
                content=new_content,
                target_metric=target_metric,
            )
            variants.append(variant)

        return variants
