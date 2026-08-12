"""
Niche Expert Persona definition.
Characteristics: deep domain knowledge, values technical rigor and genuine insight, detects clichés and misinformation.
"""

from virality_lab.core.persona import AttentionSpan, Persona


def create_niche_expert() -> Persona:
    """Create a standard Niche Expert persona."""
    return Persona(
        name="Niche Expert",
        age_range=(28, 55),
        interests=["domain depth", "technical rigor", "original research", "industry case studies", "best practices"],
        attention_span=AttentionSpan.HIGH,
        trend_sensitivity=0.40,
        humor_preference=0.35,
        clickbait_tolerance=0.20,
        novelty_preference=0.85,
        share_tendency=0.55,
        comment_tendency=0.65,
        dislikes=["surface-level tips", "factual errors", "oversimplification", "stale clichés"],
        occupation="Senior Specialist / Industry Expert",
        description="Assesses factual accuracy, depth of substance, and novelty beyond superficial advice.",
    )
