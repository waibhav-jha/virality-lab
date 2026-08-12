"""
Pydantic schemas and data models for the Content Optimization Engine.
Defines immutable ContentVariants, Evaluation comparisons, Guardrail audits,
Iteration tracking, and OptimizationResults.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.schemas import ViralityScore


class OptimizationTarget(str, Enum):
    """Specific content dimension targeted by an optimization strategy."""

    HOOK = "hook"
    CAPTION = "caption"
    STRUCTURE = "structure"
    PAYOFF = "payoff"
    CTA = "cta"
    THUMBNAIL = "thumbnail"
    EMOTIONAL_INTENSITY = "emotional_intensity"
    NOVELTY = "novelty"
    CLARITY = "clarity"
    SHAREABILITY = "shareability"
    RELATABILITY = "relatability"


class OptimizationObjective(str, Enum):
    """The creator's strategic optimization goal."""

    OVERALL = "overall"
    REACH = "reach"
    RETENTION = "retention"
    SHARES = "shares"
    COMMENTS = "comments"
    SAVES = "saves"
    FOLLOWERS = "followers"


class ContentVariant(BaseModel):
    """
    An immutable modified variant of a piece of content created to address specific weaknesses.
    Does not mutate the original content.
    """

    variant_id: str = Field(..., description="Unique identifier for this variant.")
    parent_content_id: str = Field(..., description="ID of the original parent content.")
    optimization_target: OptimizationTarget = Field(..., description="Target dimension addressed by this variant.")
    strategy_name: str = Field(..., description="Name of the strategy used to produce this variant.")
    changes: List[str] = Field(default_factory=list, description="Specific micro-changes applied.")
    reason: str = Field(..., description="Diagnostic justification for this change.")
    content: Content = Field(..., description="The new immutable Content instance.")
    target_metric: Optional[str] = Field(default=None, description="The specific behavioral metric intended to improve.")


class OptimizationComparison(BaseModel):
    """
    Detailed delta comparison between baseline content and an evaluated variant.
    """

    original_score: float = Field(..., ge=0.0, le=100.0, description="Original overall virality potential score.")
    variant_score: float = Field(..., ge=0.0, le=100.0, description="Variant overall virality potential score.")
    absolute_change: float = Field(..., description="Point delta (variant_score - original_score).")
    relative_change: float = Field(..., description="Percentage change ((variant - original) / original * 100).")
    component_changes: Dict[str, float] = Field(default_factory=dict, description="Point deltas per component dimension.")
    audience_changes: Dict[str, float] = Field(default_factory=dict, description="Point deltas per persona segment.")
    agreement_change: float = Field(default=0.0, description="Change in audience agreement percentage.")
    is_regression: bool = Field(default=False, description="Flagged true if critical guardrails failed.")
    regression_reasons: List[str] = Field(default_factory=list, description="Explanation of any regressions detected.")


class EvaluatedVariant(BaseModel):
    """
    A generated variant that has gone through the complete evaluation pipeline:
    Analysis -> Audience Simulation -> Virality Scoring -> Comparison.
    """

    variant: ContentVariant = Field(..., description="The underlying content variant.")
    profile: Optional[ContentProfile] = Field(default=None, description="ContentProfile of the variant.")
    simulation_result: Optional[SimulationResult] = Field(default=None, description="Simulated audience reactions to the variant.")
    score: ViralityScore = Field(..., description="Calculated ViralityScore of the variant.")
    comparison: OptimizationComparison = Field(..., description="Comparison metrics against baseline.")
    guardrail_passed: bool = Field(default=True, description="Whether variant passed regression guardrails.")
    guardrail_rejections: List[str] = Field(default_factory=list, description="Reasons for guardrail rejection.")


class OptimizationIteration(BaseModel):
    """
    Record of a single optimization step containing generated variants, evaluations, and winner.
    """

    iteration_index: int = Field(..., ge=0, description="Iteration number (0-indexed).")
    baseline_content: Content = Field(..., description="Baseline content for this iteration.")
    baseline_score: ViralityScore = Field(..., description="Baseline score.")
    evaluated_variants: List[EvaluatedVariant] = Field(default_factory=list, description="All evaluated variants.")
    winning_variant: Optional[EvaluatedVariant] = Field(default=None, description="Selected winning variant.")
    stopped_reason: Optional[str] = Field(default=None, description="Reason iteration concluded or halted.")


class OptimizationResult(BaseModel):
    """
    Complete output of the Content Optimization Engine.
    Preserves original state, full iteration history, all evaluated variants, and winning content.
    """

    original_content: Content = Field(..., description="Original input content asset.")
    original_score: ViralityScore = Field(..., description="Baseline virality potential score.")
    history: List[OptimizationIteration] = Field(default_factory=list, description="Audit log of optimization iterations.")
    best_variant: Optional[EvaluatedVariant] = Field(default=None, description="Best performing evaluated variant.")
    best_content: Content = Field(..., description="The final best content asset (original or variant).")
    best_score: ViralityScore = Field(..., description="Final best virality score.")
    overall_improvement: float = Field(default=0.0, description="Net point improvement (best_score - original_score).")
    summary: str = Field(default="", description="Executive summary of the optimization run.")

    def render_ascii_report(self) -> str:
        """Render a formatted ASCII optimization summary report."""
        def bar(score: float, width: int = 10) -> str:
            filled = int(round((score / 100.0) * width))
            filled = max(0, min(width, filled))
            return "#" * filled + "-" * (width - filled)

        lines = [
            "=" * 75,
            "  VIRALITY LAB -- CONTENT OPTIMIZATION REPORT",
            "=" * 75,
            f"BASELINE SCORE:       {self.original_score.overall_score:.1f} / 100  [{bar(self.original_score.overall_score)}]",
            f"OPTIMIZED SCORE:      {self.best_score.overall_score:.1f} / 100  [{bar(self.best_score.overall_score)}]",
            f"NET IMPROVEMENT:      {'+' if self.overall_improvement >= 0 else ''}{self.overall_improvement:.1f} points",
            "-" * 75,
            "ITERATION SUMMARY:",
        ]

        if not self.history:
            lines.append("  No optimization iterations performed.")
        else:
            for iteration in self.history:
                lines.append(f"  Iteration #{iteration.iteration_index + 1}: {len(iteration.evaluated_variants)} variants evaluated")
                for ev in iteration.evaluated_variants:
                    is_winner = iteration.winning_variant and ev.variant.variant_id == iteration.winning_variant.variant.variant_id
                    status = "[WINNER]" if is_winner else ("[PASSED]" if ev.guardrail_passed else "[REJECTED]")
                    delta = ev.comparison.absolute_change
                    lines.append(
                        f"    * {ev.variant.variant_id} ({ev.variant.optimization_target.value.upper()}): "
                        f"{ev.score.overall_score:.1f}/100 ({'+' if delta >= 0 else ''}{delta:.1f} pts) {status}"
                    )
                    if ev.variant.changes:
                        lines.append(f"      Change: {ev.variant.changes[0]}")

        if self.best_variant:
            lines.extend([
                "-" * 75,
                "WINNER BREAKDOWN:",
                f"  Target:     {self.best_variant.variant.optimization_target.value.upper()}",
                f"  Strategy:   {self.best_variant.variant.strategy_name}",
                f"  Reason:     {self.best_variant.variant.reason}",
                "",
                "COMPONENT SHIFTS:",
                f"  * Retention:  {self.original_score.components.retention:.1f} -> {self.best_score.components.retention:.1f} "
                f"({'+' if self.best_variant.comparison.component_changes.get('retention', 0) >= 0 else ''}{self.best_variant.comparison.component_changes.get('retention', 0):.1f} pts)",
                f"  * Sharing:    {self.original_score.components.sharing:.1f} -> {self.best_score.components.sharing:.1f} "
                f"({'+' if self.best_variant.comparison.component_changes.get('sharing', 0) >= 0 else ''}{self.best_variant.comparison.component_changes.get('sharing', 0):.1f} pts)",
                f"  * Engagement: {self.original_score.components.engagement:.1f} -> {self.best_score.components.engagement:.1f} "
                f"({'+' if self.best_variant.comparison.component_changes.get('engagement', 0) >= 0 else ''}{self.best_variant.comparison.component_changes.get('engagement', 0):.1f} pts)",
                f"  * Conversion: {self.original_score.components.conversion:.1f} -> {self.best_score.components.conversion:.1f} "
                f"({'+' if self.best_variant.comparison.component_changes.get('conversion', 0) >= 0 else ''}{self.best_variant.comparison.component_changes.get('conversion', 0):.1f} pts)",
                "",
                "AUDIENCE SEGMENT SHIFTS:",
            ])
            for persona_name, diff in self.best_variant.comparison.audience_changes.items():
                orig_p = self.original_score.audience.persona_scores.get(persona_name)
                opt_p = self.best_score.audience.persona_scores.get(persona_name)
                orig_val = orig_p.overall_score if orig_p else 0.0
                opt_val = opt_p.overall_score if opt_p else 0.0
                lines.append(f"  * {persona_name:<20} {orig_val:>5.1f} -> {opt_val:>5.1f} ({'+' if diff >= 0 else ''}{diff:.1f} pts)")

        lines.extend([
            "=" * 75,
            "NOTE: Optimization scores represent simulated audience response within our model bounds.",
            "=" * 75,
        ])

        return "\n".join(lines)
