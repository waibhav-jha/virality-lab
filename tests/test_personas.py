"""
Unit tests for Persona models, validation rules, and YAML configuration loading.
"""

import pytest
from pydantic import ValidationError

from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.config.loader import load_default_personas, load_personas_from_yaml


def test_valid_persona_creation():
    """Test creating a valid persona with custom attributes."""
    p = Persona(
        name="Tech Enthusiast",
        age_range=(20, 30),
        interests=["AI", "Python", "Gadgets"],
        attention_span=AttentionSpan.MEDIUM,
        trend_sensitivity=0.8,
        humor_preference=0.7,
        clickbait_tolerance=0.2,
        novelty_preference=0.9,
        share_tendency=0.6,
        comment_tendency=0.5,
        dislikes=["spam", "low quality audio"],
        occupation="Software Engineer",
    )
    assert p.name == "Tech Enthusiast"
    assert p.age_range == (20, 30)
    assert p.attention_span == AttentionSpan.MEDIUM
    assert p.trend_sensitivity == 0.8
    assert "AI" in p.interests
    assert "Tech Enthusiast" in p.to_prompt_context()


def test_persona_invalid_age_range():
    """Test that invalid age ranges raise ValidationError."""
    # Min age > Max age
    with pytest.raises(ValidationError):
        Persona(name="Invalid Age", age_range=(35, 20))

    # Negative age
    with pytest.raises(ValidationError):
        Persona(name="Negative Age", age_range=(-5, 20))

    # Single number in age range
    with pytest.raises(ValidationError):
        Persona(name="Malformed Age", age_range=(20,))


def test_persona_trait_out_of_bounds():
    """Test that trait probabilities outside [0.0, 1.0] raise ValidationError."""
    # > 1.0
    with pytest.raises(ValidationError):
        Persona(name="Over Bounds", trend_sensitivity=1.5)

    # < 0.0
    with pytest.raises(ValidationError):
        Persona(name="Under Bounds", clickbait_tolerance=-0.1)


def test_load_default_personas():
    """Test loading the 5 canonical personas from YAML config."""
    personas = load_default_personas()
    assert len(personas) == 5

    names = [p.name for p in personas]
    assert "Gen-Z Student" in names
    assert "Casual Scroller" in names
    assert "Content Creator" in names
    assert "Skeptic" in names
    assert "Niche Expert" in names

    # Verify attributes of Gen-Z Student
    gen_z = next(p for p in personas if p.name == "Gen-Z Student")
    assert gen_z.age_range == (18, 24)
    assert gen_z.attention_span == AttentionSpan.LOW
    assert gen_z.trend_sensitivity == 0.90
    assert gen_z.share_tendency == 0.85

    # Verify attributes of Skeptic
    skeptic = next(p for p in personas if p.name == "Skeptic")
    assert skeptic.clickbait_tolerance == 0.10
    assert "exaggerated claims" in [d.lower() for d in skeptic.dislikes]
