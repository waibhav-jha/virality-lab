"""
Scoring interfaces and models for Virality Lab.
Provides clean extension points for calculating audience engagement potential
without mixing scoring logic directly into agents or the simulation engine.
"""

from typing import Any, Dict, Tuple
from pydantic import BaseModel, Field


class ViralityScoreBreakdown(BaseModel):
    """
    Detailed breakdown of engagement potential on a 0–100 scale.
    Clearly identifies simulated metrics and includes uncertainty / scientific disclaimer.
    """

    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall simulated virality potential (0-100).")
    stop_scroll_score: float = Field(..., ge=0.0, le=100.0, description="First-glance hook effectiveness (0-100).")
    retention_score: float = Field(..., ge=0.0, le=100.0, description="Watch completion / retention potential (0-100).")
    shareability_score: float = Field(..., ge=0.0, le=100.0, description="Organic sharing / peer-forwarding tendency (0-100).")
    discussion_score: float = Field(..., ge=0.0, le=100.0, description="Comment and debate driver (0-100).")
    confidence_interval: Tuple[float, float] = Field(default=(0.0, 100.0), description="Estimated range of variance.")
    disclaimer: str = Field(
        default="This score represents simulated audience response, not a guaranteed prediction of real-world virality.",
        description="Scientific caveat explaining simulation bounds.",
    )

    @property
    def virality_potential(self) -> float:
        """Alias for overall_score."""
        return self.overall_score

    def render_ascii_bars(self) -> str:
        """Render a clean CLI-friendly ASCII bar representation of the score."""
        def bar(score: float) -> str:
            filled = int(round(score / 10))
            return "█" * filled + "░" * (10 - filled)

        lines = [
            f"SIMULATED VIRALITY POTENTIAL: {self.overall_score:.1f} / 100",
            f"Stop Scroll       {bar(self.stop_scroll_score)} {self.stop_scroll_score:.1f}",
            f"Watch Retention   {bar(self.retention_score)} {self.retention_score:.1f}",
            f"Shareability      {bar(self.shareability_score)} {self.shareability_score:.1f}",
            f"Discussion        {bar(self.discussion_score)} {self.discussion_score:.1f}",
            f"Disclaimer: {self.disclaimer}",
        ]
        return "\n".join(lines)


class ScoringEngine:
    """
    Baseline scoring engine translating statistical aggregates into normalized 0-100 virality indices.
    Designed for future platform-specific calibrations (TikTok vs Instagram vs LinkedIn).
    """

    DEFAULT_WEIGHTS: Dict[str, float] = {
        "stop_scroll": 0.30,
        "watch": 0.25,
        "completion": 0.15,
        "share": 0.20,
        "comment": 0.05,
        "like": 0.05,
    }

    def __init__(self, custom_weights: Dict[str, float] = None) -> None:
        self.weights = custom_weights or self.DEFAULT_WEIGHTS

    def calculate(self, aggregate_reaction: Any) -> ViralityScoreBreakdown:
        """
        Calculate score breakdown from an AggregateReaction instance.
        """
        # Basic weighted linear combination scaled to 0-100
        stop_scroll = getattr(aggregate_reaction, "mean_stop_scroll", 0.5) * 100
        watch = getattr(aggregate_reaction, "mean_watch_probability", 0.5) * 100
        completion = getattr(aggregate_reaction, "mean_completion_probability", 0.5) * 100
        share = getattr(aggregate_reaction, "mean_share_probability", 0.5) * 100
        comment = getattr(aggregate_reaction, "mean_comment_probability", 0.5) * 100
        like = getattr(aggregate_reaction, "mean_like_probability", 0.5) * 100

        retention = (watch * 0.6) + (completion * 0.4)

        overall = (
            stop_scroll * self.weights.get("stop_scroll", 0.30)
            + watch * self.weights.get("watch", 0.25)
            + completion * self.weights.get("completion", 0.15)
            + share * self.weights.get("share", 0.20)
            + comment * self.weights.get("comment", 0.05)
            + like * self.weights.get("like", 0.05)
        )

        overall_clamped = max(0.0, min(100.0, overall))

        return ViralityScoreBreakdown(
            overall_score=round(overall_clamped, 1),
            stop_scroll_score=round(stop_scroll, 1),
            retention_score=round(retention, 1),
            shareability_score=round(share, 1),
            discussion_score=round(comment, 1),
            confidence_interval=(max(0.0, round(overall_clamped - 7.5, 1)), min(100.0, round(overall_clamped + 7.5, 1))),
        )
