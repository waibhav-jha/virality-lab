"""
Audience Persona definition with behavioral traits, preferences, and attention profiles.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator, model_validator


class AttentionSpan(str, Enum):
    """Simulated user attention span level."""

    EXTREMELY_LOW = "extremely_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Persona(BaseModel):
    """
    Structured persona representing an audience segment.
    Contains concrete behavioral characteristics rather than vague text prompts.
    """

    name: str = Field(..., min_length=1, description="Name or title of the persona.")
    age_range: Tuple[int, int] = Field(default=(18, 30), description="Age range (min_age, max_age).")
    interests: List[str] = Field(default_factory=list, description="Topics and themes the persona cares about.")
    attention_span: AttentionSpan = Field(default=AttentionSpan.LOW, description="Attention span level.")
    trend_sensitivity: float = Field(default=0.5, ge=0.0, le=1.0, description="Receptivity to trending audio/topics (0-1).")
    humor_preference: float = Field(default=0.5, ge=0.0, le=1.0, description="Preference for humor/memes (0-1).")
    clickbait_tolerance: float = Field(default=0.5, ge=0.0, le=1.0, description="Tolerance for hype and exaggerated claims (0-1).")
    novelty_preference: float = Field(default=0.5, ge=0.0, le=1.0, description="Preference for fresh, unseen formats/ideas (0-1).")
    share_tendency: float = Field(default=0.5, ge=0.0, le=1.0, description="Likelihood of sharing content with peers (0-1).")
    comment_tendency: float = Field(default=0.5, ge=0.0, le=1.0, description="Likelihood of leaving comments/opinions (0-1).")
    dislikes: List[str] = Field(default_factory=list, description="Pet peeves, turn-offs, or negative triggers.")
    occupation: Optional[str] = Field(default=None, description="Occupation or lifestyle context.")
    description: Optional[str] = Field(default=None, description="High-level background summary.")

    @field_validator("age_range")
    @classmethod
    def validate_age_range(cls, v: Tuple[int, int]) -> Tuple[int, int]:
        if len(v) != 2:
            raise ValueError("age_range must be a tuple/list of exactly 2 integers (min_age, max_age).")
        min_age, max_age = v
        if min_age <= 0 or max_age <= 0:
            raise ValueError("Ages in age_range must be positive integers.")
        if min_age > max_age:
            raise ValueError(f"min_age ({min_age}) cannot be greater than max_age ({max_age}).")
        return v

    def to_prompt_context(self) -> str:
        """Render the persona's behavioral profile into a structured prompt section."""
        interests_str = ", ".join(self.interests) if self.interests else "General topics"
        dislikes_str = ", ".join(self.dislikes) if self.dislikes else "Generic unengaging content"
        
        lines = [
            f"### PERSONA: {self.name}",
            f"- **Age Bracket**: {self.age_range[0]}–{self.age_range[1]} years old",
            f"- **Occupation/Lifestyle**: {self.occupation or 'General audience'}",
            f"- **Attention Span**: {self.attention_span.value.replace('_', ' ').title()}",
            f"- **Key Interests**: {interests_str}",
            f"- **Dislikes / Turn-offs**: {dislikes_str}",
            f"- **Behavioral Index (0.0 to 1.0)**:",
            f"  * Trend Sensitivity: {self.trend_sensitivity:.2f}",
            f"  * Humor Preference: {self.humor_preference:.2f}",
            f"  * Clickbait Tolerance: {self.clickbait_tolerance:.2f}",
            f"  * Novelty Preference: {self.novelty_preference:.2f}",
            f"  * Sharing Tendency: {self.share_tendency:.2f}",
            f"  * Comment Tendency: {self.comment_tendency:.2f}",
        ]
        if self.description:
            lines.append(f"- **Profile Note**: {self.description}")
        return "\n".join(lines)

    def to_dict(self) -> Dict[str, Any]:
        """Convert persona model to dictionary."""
        return self.model_dump()
