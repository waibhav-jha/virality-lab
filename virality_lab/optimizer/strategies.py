"""
Modular Content Optimization Strategies.
Each strategy defines:
1. What content element it modifies.
2. Why it modifies it based on diagnostic evidence.
3. Strict constraints preserving topic, factual integrity, and creator intent.
"""

from abc import ABC, abstractmethod
import copy
from typing import Any, Dict, List, Optional, Tuple

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content, MediaType
from virality_lab.optimizer.diagnostics_mapper import DiagnosticActionPlan
from virality_lab.optimizer.schemas import ContentVariant, OptimizationObjective, OptimizationTarget
from virality_lab.scoring.schemas import ViralityScore


class BaseOptimizationStrategy(ABC):
    """Abstract base class for all single-target content optimization strategies."""

    def __init__(self, name: str, target: OptimizationTarget) -> None:
        self.name = name
        self.target = target

    @abstractmethod
    def can_handle(self, content: Content) -> bool:
        """Check if this strategy is applicable to the content's media type."""
        pass

    @abstractmethod
    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        """Generate (system_prompt, user_prompt) for the LLM optimizer."""
        pass

    def create_variant(
        self,
        original_content: Content,
        variant_id: str,
        modified_content: Content,
        changes: List[str],
        reason: str,
        target_metric: Optional[str] = None,
    ) -> ContentVariant:
        """Construct an immutable ContentVariant."""
        return ContentVariant(
            variant_id=variant_id,
            parent_content_id=original_content.id,
            optimization_target=self.target,
            strategy_name=self.name,
            changes=changes,
            reason=reason,
            content=modified_content,
            target_metric=target_metric or self.target.value,
        )


class HookOptimizationStrategy(BaseOptimizationStrategy):
    """Optimizes the opening 1-3 seconds (hook/opening line) to maximize stop-scroll and retention."""

    def __init__(self) -> None:
        super().__init__(name="HookOptimizationStrategy", target=OptimizationTarget.HOOK)

    def can_handle(self, content: Content) -> bool:
        return True

    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are an expert Social Media Content Optimizer for Virality Lab.\n"
            "Your job is to generate a stronger OPENING HOOK for the content.\n\n"
            "CRITICAL RULES:\n"
            "1. ONLY modify the opening hook/first sentence. Keep the rest of the message unchanged.\n"
            "2. Preserve original topic, creator intent, platform context, and all factual claims.\n"
            "3. DO NOT fabricate statistics, fake quotes, or ungrounded claims.\n"
            "4. Return strict JSON with fields: 'new_hook', 'full_caption', 'full_transcript', 'change_summary', 'rationale'."
        )

        user_prompt = (
            f"DIAGNOSTIC EVIDENCE:\n{plan.evidence}\n"
            f"OBJECTIVE: {objective.value.upper()} (Target: {plan.target_metric})\n"
            f"ACTION PRESCRIBED: {plan.suggested_action}\n\n"
            f"CURRENT CONTENT ({content.platform.value} / {content.media_type.value}):\n"
            f"Caption: {content.caption}\n"
            f"Transcript: {content.transcript or '(None)'}\n\n"
            "Generate 1 high-performing hook variation that stops scrolling within 2 seconds."
        )
        return system_prompt, user_prompt


class CaptionOptimizationStrategy(BaseOptimizationStrategy):
    """Optimizes caption scannability, bookmark cues, and reference density to maximize saves & engagement."""

    def __init__(self) -> None:
        super().__init__(name="CaptionOptimizationStrategy", target=OptimizationTarget.CAPTION)

    def can_handle(self, content: Content) -> bool:
        return True

    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are an expert Social Media Content Optimizer for Virality Lab.\n"
            "Your job is to optimize the CAPTION for readability, reference value, and saves.\n\n"
            "CRITICAL RULES:\n"
            "1. Improve formatting (bullet points, clear structure, actionable steps).\n"
            "2. Preserve all original facts and core message.\n"
            "3. DO NOT add clickbait or unrelated hashtags.\n"
            "4. Return strict JSON with fields: 'full_caption', 'change_summary', 'rationale'."
        )

        user_prompt = (
            f"DIAGNOSTIC EVIDENCE:\n{plan.evidence}\n"
            f"OBJECTIVE: {objective.value.upper()}\n"
            f"ACTION PRESCRIBED: {plan.suggested_action}\n\n"
            f"CURRENT CAPTION:\n{content.caption}\n\n"
            "Generate a restructured, highly saveable caption."
        )
        return system_prompt, user_prompt


class StructureOptimizationStrategy(BaseOptimizationStrategy):
    """Optimizes pacing and moves payoff earlier to prevent audience drop-off."""

    def __init__(self) -> None:
        super().__init__(name="StructureOptimizationStrategy", target=OptimizationTarget.STRUCTURE)

    def can_handle(self, content: Content) -> bool:
        return content.media_type in (MediaType.SHORT_VIDEO, MediaType.TEXT_POST, MediaType.CAROUSEL)

    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are an expert Social Media Content Optimizer for Virality Lab.\n"
            "Your job is to optimize the CONTENT STRUCTURE and narrative pacing.\n\n"
            "CRITICAL RULES:\n"
            "1. Front-load the key payoff earlier in the script/text.\n"
            "2. Eliminate slow filler or preamble.\n"
            "3. Preserve all factual claims and creator intent.\n"
            "4. Return strict JSON with fields: 'full_caption', 'full_transcript', 'change_summary', 'rationale'."
        )

        user_prompt = (
            f"DIAGNOSTIC EVIDENCE:\n{plan.evidence}\n"
            f"OBJECTIVE: {objective.value.upper()}\n"
            f"ACTION PRESCRIBED: {plan.suggested_action}\n\n"
            f"CURRENT CONTENT:\nCaption: {content.caption}\nTranscript: {content.transcript or '(None)'}\n\n"
            "Generate a tighter, faster-paced structural variation."
        )
        return system_prompt, user_prompt


class CTAOptimizationStrategy(BaseOptimizationStrategy):
    """Optimizes the closing call-to-action to maximize profile discovery, follows, and comments."""

    def __init__(self) -> None:
        super().__init__(name="CTAOptimizationStrategy", target=OptimizationTarget.CTA)

    def can_handle(self, content: Content) -> bool:
        return True

    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are an expert Social Media Content Optimizer for Virality Lab.\n"
            "Your job is to craft a natural, high-converting CALL TO ACTION (CTA).\n\n"
            "CRITICAL RULES:\n"
            "1. Provide a clear reason for the audience to follow, save, or reply.\n"
            "2. Do NOT use generic 'Follow for more!' or spammy phrasing.\n"
            "3. Preserve the core message and topic.\n"
            "4. Return strict JSON with fields: 'full_caption', 'full_transcript', 'change_summary', 'rationale'."
        )

        user_prompt = (
            f"DIAGNOSTIC EVIDENCE:\n{plan.evidence}\n"
            f"OBJECTIVE: {objective.value.upper()}\n"
            f"ACTION PRESCRIBED: {plan.suggested_action}\n\n"
            f"CURRENT CONTENT:\nCaption: {content.caption}\n\n"
            "Generate a contextual CTA enhancement."
        )
        return system_prompt, user_prompt


class ShareabilityOptimizationStrategy(BaseOptimizationStrategy):
    """Optimizes content framing for social currency, group forwarding, and relatability."""

    def __init__(self) -> None:
        super().__init__(name="ShareabilityOptimizationStrategy", target=OptimizationTarget.SHAREABILITY)

    def can_handle(self, content: Content) -> bool:
        return True

    def build_prompt(
        self,
        content: Content,
        score: ViralityScore,
        plan: DiagnosticActionPlan,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are an expert Social Media Content Optimizer for Virality Lab.\n"
            "Your job is to optimize the framing to maximize SHAREABILITY and social currency.\n\n"
            "CRITICAL RULES:\n"
            "1. Frame the value takeaway so viewers want to forward it to friends/colleagues.\n"
            "2. Preserve all original facts and identity.\n"
            "3. DO NOT invent false controversies or exaggerated claims.\n"
            "4. Return strict JSON with fields: 'full_caption', 'full_transcript', 'change_summary', 'rationale'."
        )

        user_prompt = (
            f"DIAGNOSTIC EVIDENCE:\n{plan.evidence}\n"
            f"OBJECTIVE: {objective.value.upper()}\n"
            f"ACTION PRESCRIBED: {plan.suggested_action}\n\n"
            f"CURRENT CONTENT:\nCaption: {content.caption}\nTranscript: {content.transcript or '(None)'}\n\n"
            "Generate a shareability-optimized variation."
        )
        return system_prompt, user_prompt
