"""
Gen-Z Student Persona definition.
Characteristics: 18-24, high trend sensitivity, low patience, likes relatable humor and novelty, shares frequently.
"""

from virality_lab.core.persona import AttentionSpan, Persona


def create_gen_z_student() -> Persona:
    """Create a standard Gen-Z Student persona."""
    return Persona(
        name="Gen-Z Student",
        age_range=(18, 24),
        interests=["AI tools", "college life", "gaming", "memes", "short-form comedy", "tech hacks"],
        attention_span=AttentionSpan.LOW,
        trend_sensitivity=0.90,
        humor_preference=0.85,
        clickbait_tolerance=0.35,
        novelty_preference=0.90,
        share_tendency=0.85,
        comment_tendency=0.60,
        dislikes=["corporate jargon", "slow pacing", "generic study advice", "overly formal lectures"],
        occupation="Undergraduate Student",
        description="Fast scroller seeking relatable, funny, or instantly actionable life/college hacks.",
    )
