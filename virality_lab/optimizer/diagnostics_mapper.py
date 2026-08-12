"""
Diagnostic-to-Action mapping engine.
Maps concrete behavioral metrics, weak dimensions, and audience friction points
to prioritized, targeted optimization actions without guesswork.
"""

from typing import Any, List, Optional
from pydantic import BaseModel, Field

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content, MediaType
from virality_lab.optimizer.schemas import OptimizationObjective, OptimizationTarget
from virality_lab.scoring.schemas import ViralityScore


class DiagnosticActionPlan(BaseModel):
    """Specific actionable plan linking an identified weakness to an optimization target."""

    target: OptimizationTarget = Field(..., description="Target dimension to optimize.")
    priority: int = Field(..., description="Priority ranking (1 = highest priority).")
    evidence: str = Field(..., description="Simulated metrics and reasoning justifying this action.")
    suggested_action: str = Field(..., description="Specific modification strategy prescribed.")
    target_metric: str = Field(..., description="Primary behavioral metric this action seeks to improve.")


class DiagnosticsMapper:
    """
    Deterministic rule engine that analyzes ViralityScore and ContentProfile
    to select the highest-leverage optimization targets.
    """

    def map_diagnostics_to_plans(
        self,
        content: Content,
        score: ViralityScore,
        profile: Optional[ContentProfile] = None,
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> List[DiagnosticActionPlan]:
        """
        Analyze simulation diagnostics and return prioritized list of DiagnosticActionPlans.
        """
        plans: List[DiagnosticActionPlan] = []
        media_type = content.media_type
        raw = score.raw_metrics
        comps = score.components

        # 1. Evaluate Hook Power (Retention Hook)
        ss_mean = raw.get("stop_scroll").mean if "stop_scroll" in raw else comps.retention / 100.0
        if ss_mean < 0.75 or comps.retention < 60.0 or score.diagnostics.weakest_dimension == "retention":
            plans.append(
                DiagnosticActionPlan(
                    target=OptimizationTarget.HOOK,
                    priority=1 if (ss_mean < 0.65 or score.diagnostics.weakest_dimension == "retention") else 2,
                    evidence=f"Stop-scroll rate is {ss_mean * 100:.1f}%; retention dimension is {comps.retention:.1f}/100.",
                    suggested_action="Sharpen opening 1-3s hook with specific value promise, curiosity gap, or relatable problem framing.",
                    target_metric="stop_scroll",
                )
            )

        # 2. Evaluate Shareability & Social Currency
        sh_mean = raw.get("share_probability").mean if "share_probability" in raw else comps.sharing / 100.0
        if sh_mean < 0.60 or comps.sharing < 60.0 or objective in (OptimizationObjective.SHARES, OptimizationObjective.REACH):
            plans.append(
                DiagnosticActionPlan(
                    target=OptimizationTarget.SHAREABILITY,
                    priority=1 if objective in (OptimizationObjective.SHARES, OptimizationObjective.REACH) else 3,
                    evidence=f"Share probability is {sh_mean * 100:.1f}%; sharing dimension is {comps.sharing:.1f}/100.",
                    suggested_action="Inject high social currency, surprising utility, or relatable group-forwarding dynamic.",
                    target_metric="share_probability",
                )
            )

        # 3. Evaluate Narrative Structure & Completion Drop-off (Video / Text / Carousel)
        if media_type in (MediaType.SHORT_VIDEO, MediaType.TEXT_POST, MediaType.CAROUSEL):
            comp_mean = raw.get("completion_probability").mean if "completion_probability" in raw else comps.retention / 100.0
            if comp_mean < 0.65:
                plans.append(
                    DiagnosticActionPlan(
                        target=OptimizationTarget.STRUCTURE,
                        priority=2,
                        evidence=f"Completion rate is {comp_mean * 100:.1f}%; audience drops off before payoff.",
                        suggested_action="Front-load payoff earlier, eliminate slow preamble, and tighten narrative progression.",
                        target_metric="completion_probability",
                    )
                )

        # 4. Evaluate Caption Reference Utility & Saves
        sv_mean = raw.get("save_probability").mean if "save_probability" in raw else comps.engagement / 100.0
        if sv_mean < 0.65 or comps.engagement < 55.0:
            plans.append(
                DiagnosticActionPlan(
                    target=OptimizationTarget.CAPTION,
                    priority=4,
                    evidence=f"Save probability is {sv_mean * 100:.1f}%; engagement dimension is {comps.engagement:.1f}/100.",
                    suggested_action="Structure caption with clear bullet points, actionable step-by-step summary, and bookmark cues.",
                    target_metric="save_probability",
                )
            )

        # 5. Evaluate Conversion & CTA
        fl_mean = raw.get("follow_probability").mean if "follow_probability" in raw else comps.conversion / 100.0
        if fl_mean < 0.40 or objective == OptimizationObjective.FOLLOWERS:
            plans.append(
                DiagnosticActionPlan(
                    target=OptimizationTarget.CTA,
                    priority=1 if objective == OptimizationObjective.FOLLOWERS else 5,
                    evidence=f"Follow intent is {fl_mean * 100:.1f}%; conversion dimension is {comps.conversion:.1f}/100.",
                    suggested_action="Add clear, contextual creator value proposition call-to-action.",
                    target_metric="follow_probability",
                )
            )

        # Ensure fallback plan if all metrics are high
        if not plans:
            plans.append(
                DiagnosticActionPlan(
                    target=OptimizationTarget.HOOK,
                    priority=1,
                    evidence=f"Overall score {score.overall_score:.1f}/100 is solid, but hook variation can explore upside potential.",
                    suggested_action="Generate alternative high-energy hook angles to test audience ceiling.",
                    target_metric="stop_scroll",
                )
            )

        # Sort by priority ascending (1 first)
        plans.sort(key=lambda p: p.priority)
        return plans
