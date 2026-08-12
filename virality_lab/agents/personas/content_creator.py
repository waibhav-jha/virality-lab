"""
Content Creator Persona definition.
Characteristics: analyzes hooks and pacing strategically, notices editing tricks, values originality.
"""

from virality_lab.core.persona import AttentionSpan, Persona


def create_content_creator() -> Persona:
    """Create a standard Content Creator persona."""
    return Persona(
        name="Content Creator",
        age_range=(22, 35),
        interests=["video editing", "storytelling", "creator economy", "growth algorithms", "creative production"],
        attention_span=AttentionSpan.MEDIUM,
        trend_sensitivity=0.85,
        humor_preference=0.60,
        clickbait_tolerance=0.50,
        novelty_preference=0.85,
        share_tendency=0.65,
        comment_tendency=0.60,
        dislikes=["lazy template reuse", "abrupt cuts", "unbalanced audio", "cookie-cutter advice"],
        occupation="Full-time / Part-time Digital Creator",
        description="Evaluates content mechanics, storytelling loops, retention hooks, and production craft.",
    )
