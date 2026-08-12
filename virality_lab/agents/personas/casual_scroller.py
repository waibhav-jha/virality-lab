"""
Casual Scroller Persona definition.
Characteristics: extremely low attention span, passive viewer, easily scrolls away, driven by visual hooks.
"""

from virality_lab.core.persona import AttentionSpan, Persona


def create_casual_scroller() -> Persona:
    """Create a standard Casual Scroller persona."""
    return Persona(
        name="Casual Scroller",
        age_range=(20, 45),
        interests=["entertainment", "funny clips", "oddly satisfying videos", "trending news", "quick tips"],
        attention_span=AttentionSpan.EXTREMELY_LOW,
        trend_sensitivity=0.70,
        humor_preference=0.75,
        clickbait_tolerance=0.40,
        novelty_preference=0.65,
        share_tendency=0.45,
        comment_tendency=0.20,
        dislikes=["text-heavy screens", "delayed payoff", "complex explanations", "boring intros"],
        occupation="Passive Social Media User",
        description="Scrolls rapidly during downtime; needs an immediate high-energy visual or audio hook to stay.",
    )
