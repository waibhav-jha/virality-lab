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


class ScoreExplanation(BaseModel):
    """Deterministic, rule-generated explanation of the score without LLM hallucination."""

    positive_drivers: List[str] = Field(default_factory=list, description="Primary metrics driving score up.")
    negative_drivers: List[str] = Field(default_factory=list, description="Primary metrics pulling score down.")
    audience_verdict: str = Field(..., description="High-level descriptive summary of audience reaction.")


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
