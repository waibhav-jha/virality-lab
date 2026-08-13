"""
Pydantic schemas for the Virality Scoring & Audience Intelligence Engine.
Defines clean, validated models for component scores, audience dispersion,
diagnostics, deterministic explanations, and uncertainty tracking.
"""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class MetricDistribution(BaseModel):
    """Statistical distribution of a specific behavioral probability across personas."""

    mean: float = Field(..., ge=0.0, le=1.0, description="Mean probability across evaluated personas.")
    median: float = Field(..., ge=0.0, le=1.0, description="Median probability.")
    std_dev: float = Field(..., ge=0.0, description="Standard deviation measuring audience variance.")
    min_val: float = Field(..., ge=0.0, le=1.0, description="Minimum observed probability.")
    max_val: float = Field(..., ge=0.0, le=1.0, description="Maximum observed probability.")


class ComponentScores(BaseModel):
    """Component scores on a normalized 0–100 scale."""

    retention: float = Field(..., ge=0.0, le=100.0, description="Watch duration & completion potential (0-100).")
    sharing: float = Field(..., ge=0.0, le=100.0, description="Organic peer-to-peer forwarding potential (0-100).")
    engagement: float = Field(..., ge=0.0, le=100.0, description="Likes, comments/debate, and save utility (0-100).")
    conversion: float = Field(..., ge=0.0, le=100.0, description="Profile discovery and follow potential (0-100).")


class PersonaScore(BaseModel):
    """Detailed score breakdown for a single audience persona segment."""

    persona_name: str = Field(..., description="Name of the persona segment.")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Persona-specific virality score (0-100).")
    components: ComponentScores = Field(..., description="Persona component breakdown.")
    dominant_emotion: str = Field(..., description="Dominant emotional reaction.")
    reasoning: str = Field(..., description="Causal reasoning for this persona's reaction.")
    strengths: List[str] = Field(default_factory=list, description="Specific elements that resonated.")
    weaknesses: List[str] = Field(default_factory=list, description="Friction points identified.")


class AudienceAgreement(BaseModel):
    """Dispersion metric measuring how uniformly or divisively personas reacted."""

    agreement_score: float = Field(..., ge=0.0, le=1.0, description="Agreement index (1.0 = identical, 0.0 = extreme split).")
    polarization_score: float = Field(..., ge=0.0, le=1.0, description="Polarization index (1.0 - agreement).")
    level: str = Field(..., description="'high', 'moderate', or 'polarized'.")
    interpretation: str = Field(..., description="Human-readable explanation of audience consensus.")


class AudienceSummary(BaseModel):
    """Aggregate audience segment overview preserving individual persona fidelity."""

    mean_score: float = Field(..., ge=0.0, le=100.0, description="Average persona score.")
    median_score: float = Field(..., ge=0.0, le=100.0, description="Median persona score.")
    min_score: float = Field(..., ge=0.0, le=100.0, description="Lowest persona score.")
    max_score: float = Field(..., ge=0.0, le=100.0, description="Highest persona score.")
    std_dev: float = Field(..., ge=0.0, description="Score standard deviation across personas.")
    agreement: AudienceAgreement = Field(..., description="Audience agreement and polarization indices.")
    strongest_persona: str = Field(..., description="Persona that responded most positively.")
    weakest_persona: str = Field(..., description="Persona that experienced the most friction.")
    persona_scores: Dict[str, PersonaScore] = Field(default_factory=dict, description="Full per-persona breakdown.")


class ScoreDiagnostics(BaseModel):
    """Actionable strengths, weaknesses, and friction points for the future optimizer."""

    strongest_dimension: str = Field(..., description="Highest performing virality dimension.")
    weakest_dimension: str = Field(..., description="Lowest performing virality dimension.")
    strongest_persona: str = Field(..., description="Most receptive persona segment.")
    weakest_persona: str = Field(..., description="Most critical or resistant persona segment.")
    consensus_strengths: List[str] = Field(default_factory=list, description="Key resonant content elements.")
    consensus_weaknesses: List[str] = Field(default_factory=list, description="Key drop-off or friction triggers.")


class SignalAttribution(BaseModel):
    """Specific positive boost or negative friction signal detected in the content."""

    signal_id: str = Field(..., description="Unique machine identifier for the signal.")
    signal_name: str = Field(..., description="Human-readable title of the signal.")
    category: str = Field(..., description="Signal category: 'hook', 'cognitive', 'utility', 'retention', 'platform_fit', etc.")
    impact_points: float = Field(..., description="Points added (+) or deducted (-) from base quality score.")
    matched_text: Optional[str] = Field(default=None, description="Exact phrase or pattern extracted from content.")
    rationale: str = Field(..., description="Behavioral justification for why this signal influences human feed behavior.")
    confidence: float = Field(default=0.90, ge=0.0, le=1.0, description="Detection confidence score.")


class FormulaBreakdown(BaseModel):
    """Transparent mathematical derivation of how the overall virality score was computed."""

    formula_equation: str = Field(..., description="Algebraic formula string (e.g. '0.45*Retention + 0.25*Sharing + 0.15*Engagement + 0.15*Conversion').")
    raw_weighted_sum: float = Field(..., ge=0.0, le=100.0, description="Weighted sum of component dimensions before platform multiplier.")
    platform_weights: Dict[str, float] = Field(..., description="Platform-specific algorithmic weights applied.")
    platform_multiplier: float = Field(default=1.0, description="Platform calibration scaling multiplier.")
    platform_bonus_points: float = Field(default=0.0, description="Bonus or penalty points applied for platform-specific format fit.")
    calibrated_final_score: float = Field(..., ge=0.0, le=100.0, description="Final 0-100 calibrated virality score.")


class RetentionFunnelStep(BaseModel):
    """Telemetry stage along the viewer cognitive attention funnel."""

    step_name: str = Field(..., description="Funnel stage label (e.g. '0.0s Feed Impression', '1.5s Hook Window', '10s Pacing').")
    time_seconds: float = Field(..., description="Timestamp in seconds along playback or reading timeline.")
    retention_percentage: float = Field(..., ge=0.0, le=100.0, description="Estimated percentage of viewers remaining.")
    dropoff_percentage: float = Field(..., ge=0.0, le=100.0, description="Drop-off loss rate at this juncture.")
    friction_note: str = Field(..., description="Behavioral explanation for retention or drop-off.")


class VariantDifferential(BaseModel):
    """Comparative differential for a specific metric between two specimens."""

    metric_name: str = Field(..., description="Name of dimension or signal (e.g. 'Hook Velocity', 'Bookmark Probability').")
    baseline_value: float = Field(..., description="Value for baseline specimen.")
    challenger_value: float = Field(..., description="Value for challenger specimen.")
    delta: float = Field(..., description="Challenger minus baseline delta.")
    advantage: str = Field(..., description="'challenger', 'baseline', or 'neutral'.")
    causal_explanation: str = Field(..., description="Explanation of why this difference occurred.")


class ABTestExplanation(BaseModel):
    """Explainable intelligence breakdown for A/B/C head-to-head testing."""

    bayesian_win_probability: float = Field(..., ge=0.0, le=100.0, description="Bayesian posterior probability that the winner outperforms in live feeds (0-100%).")
    statistical_confidence_pct: float = Field(default=95.0, ge=0.0, le=100.0, description="Statistical sample reliability confidence index.")
    margin_of_error_pct: float = Field(default=3.5, ge=0.0, description="Margin of error range (+/- %).")
    top_win_drivers: List[str] = Field(default_factory=list, description="Ranked factors that drove the winner's victory margin.")
    differentials: List[VariantDifferential] = Field(default_factory=list, description="Head-to-head feature matrix.")


class ScoreExplanation(BaseModel):
    """Deterministic, rule-generated explanation of the score without LLM hallucination."""

    positive_drivers: List[str] = Field(default_factory=list, description="Primary metrics driving score up.")
    negative_drivers: List[str] = Field(default_factory=list, description="Primary metrics pulling score down.")
    audience_verdict: str = Field(..., description="High-level descriptive summary of audience reaction.")
    signal_attributions: List[SignalAttribution] = Field(default_factory=list, description="Itemized positive and negative signal detections.")
    formula_breakdown: Optional[FormulaBreakdown] = Field(default=None, description="Mathematical derivation ledger.")
    retention_funnel: List[RetentionFunnelStep] = Field(default_factory=list, description="Viewer drop-off funnel telemetry.")


class ScoreConfidence(BaseModel):
    """Explicit measurement of simulation reliability and agent coverage."""

    simulation_coverage: float = Field(..., ge=0.0, le=1.0, description="Ratio of successful agents to total expected.")
    evaluated_agents: int = Field(..., ge=0, description="Number of agents successfully evaluated.")
    expected_agents: int = Field(..., ge=0, description="Total number of agents configured.")
    uncertainty_level: str = Field(..., description="'low', 'moderate', or 'high'.")
    notes: List[str] = Field(default_factory=list, description="Caveats or notes regarding simulation fidelity.")


class ViralityScore(BaseModel):
    """
    Complete, validated result of the Virality Scoring & Audience Intelligence Engine.
    Scales from 0 to 100 with full interpretability and component breakdown.
    """

    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall simulated virality potential (0-100).")
    components: ComponentScores = Field(..., description="Component dimension breakdown (0-100).")
    audience: AudienceSummary = Field(..., description="Statistical audience breakdown and agreement.")
    diagnostics: ScoreDiagnostics = Field(..., description="Actionable strengths, weaknesses, and friction points.")
    explanation: ScoreExplanation = Field(..., description="Deterministic causal explanation.")
    confidence: ScoreConfidence = Field(..., description="Coverage and uncertainty metrics.")
    raw_metrics: Dict[str, MetricDistribution] = Field(default_factory=dict, description="Underlying probability distributions.")
    signal_attributions: List[SignalAttribution] = Field(default_factory=list, description="Direct access to signal detections.")
    formula_breakdown: Optional[FormulaBreakdown] = Field(default=None, description="Direct access to formula breakdown.")
    retention_funnel: List[RetentionFunnelStep] = Field(default_factory=list, description="Direct access to retention funnel.")
    disclaimer: str = Field(
        default=(
            "This score represents simulated audience response within our heuristic behavioral model, "
            "and is NOT a guaranteed prediction or probability of real-world virality."
        ),
        description="Scientific caveat explaining simulation bounds.",
    )

    def render_ascii_report(self) -> str:
        """Render a formatted, universally compatible CLI ASCII virality report."""
        def bar(score: float, width: int = 10) -> str:
            filled = int(round((score / 100.0) * width))
            filled = max(0, min(width, filled))
            return "#" * filled + "-" * (width - filled)

        lines = [
            "=" * 75,
            "  VIRALITY LAB -- SIMULATED VIRALITY REPORT",
            "=" * 75,
            f"OVERALL VIRALITY POTENTIAL:  {self.overall_score:.1f} / 100  [{bar(self.overall_score, 14)}]",
            "",
            "COMPONENT DIMENSIONS:",
            f"  * Retention:   {self.components.retention:>5.1f} / 100  [{bar(self.components.retention)}]",
            f"  * Sharing:     {self.components.sharing:>5.1f} / 100  [{bar(self.components.sharing)}]",
            f"  * Engagement:  {self.components.engagement:>5.1f} / 100  [{bar(self.components.engagement)}]",
            f"  * Conversion:  {self.components.conversion:>5.1f} / 100  [{bar(self.components.conversion)}]",
            "-" * 75,
            "AUDIENCE BREAKDOWN:",
        ]

        for name, pscore in self.audience.persona_scores.items():
            lines.append(f"  {name:<20} {pscore.overall_score:>5.1f} / 100  [{bar(pscore.overall_score)}]  ({pscore.dominant_emotion.upper()})")

        lines.extend([
            "",
            f"  Audience Agreement:    {self.audience.agreement.agreement_score * 100:.1f}% ({self.audience.agreement.level.title()})",
            f"  Audience Polarization: {self.audience.agreement.polarization_score * 100:.1f}%",
            f"  Simulation Coverage:   {self.confidence.simulation_coverage * 100:.1f}% ({self.confidence.evaluated_agents}/{self.confidence.expected_agents} agents)",
            "-" * 75,
            "DIAGNOSTICS & EXPLANATION:",
            f"  [+] Strongest Dimension: {self.diagnostics.strongest_dimension.title()} ({getattr(self.components, self.diagnostics.strongest_dimension, 0.0):.1f})",
            f"  [-] Weakest Dimension:   {self.diagnostics.weakest_dimension.title()} ({getattr(self.components, self.diagnostics.weakest_dimension, 0.0):.1f})",
            f"  [+] Top Receptive Segment: {self.diagnostics.strongest_persona}",
            f"  [-] Critical / Friction:  {self.diagnostics.weakest_persona}",
            "",
            "KEY POSITIVE DRIVERS:",
        ])

        for pos in self.explanation.positive_drivers:
            lines.append(f"  + {pos}")

        if self.explanation.negative_drivers:
            lines.append("\nKEY FRICTION POINTS:")
            for neg in self.explanation.negative_drivers:
                lines.append(f"  ! {neg}")

        lines.extend([
            "=" * 75,
            f"NOTE: {self.disclaimer}",
            "=" * 75,
        ])

        return "\n".join(lines)
