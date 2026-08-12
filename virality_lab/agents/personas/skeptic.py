"""
Skeptic Persona definition.
Characteristics: very low clickbait tolerance, detects exaggerated claims, demands authenticity and proof.
"""

from virality_lab.core.persona import AttentionSpan, Persona


def create_skeptic() -> Persona:
    """Create a standard Skeptic persona."""
    return Persona(
        name="Skeptic",
        age_range=(25, 45),
        interests=["critical thinking", "fact checking", "debunking", "science", "honest reviews"],
        attention_span=AttentionSpan.MEDIUM,
        trend_sensitivity=0.30,
        humor_preference=0.40,
        clickbait_tolerance=0.10,
        novelty_preference=0.60,
        share_tendency=0.25,
        comment_tendency=0.75,
        dislikes=["exaggerated headlines", "get-rich-quick claims", "fake reactions", "obvious AI fluff"],
        occupation="Critical Analyst / Inquisitive Viewer",
        description="Scrutinizes authenticity, quickly calls out clickbait or misleading claims in comments.",
    )
