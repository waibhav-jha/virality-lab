"""
Unit tests for Reaction schema, bounds validation, and serialization.
"""

import pytest
from pydantic import ValidationError

from virality_lab.core.reaction import EmotionalResponse, Reaction


def test_valid_reaction_creation():
    """Test creating a valid Reaction object."""
    r = Reaction(
        persona_name="Gen-Z Student",
        stop_scroll=0.85,
        watch_probability=0.75,
        completion_probability=0.60,
        like_probability=0.70,
        comment_probability=0.50,
        share_probability=0.80,
        save_probability=0.40,
        follow_probability=0.30,
        emotional_response=EmotionalResponse.ENTERTAINED.value,
        strengths=["Punchy hook", "Relatable joke"],
        weaknesses=["Slightly slow transition at 5s"],
        reasoning="The opening meme was funny and hooked me immediately.",
    )
    assert r.persona_name == "Gen-Z Student"
    assert r.stop_scroll == 0.85
    assert r.share_probability == 0.80
    assert len(r.strengths) == 2
    assert len(r.weaknesses) == 1

    summary = r.summary_table_row()
    assert summary["Persona"] == "Gen-Z Student"
    assert summary["Stop Scroll"] == "0.85"


def test_reaction_probability_bounds():
    """Test that all probability fields reject values outside [0.0, 1.0]."""
    valid_kwargs = {
        "persona_name": "Test Persona",
        "stop_scroll": 0.5,
        "watch_probability": 0.5,
        "completion_probability": 0.5,
        "like_probability": 0.5,
        "comment_probability": 0.5,
        "share_probability": 0.5,
        "save_probability": 0.5,
        "follow_probability": 0.5,
        "reasoning": "Standard reaction.",
    }

    # Test values > 1.0
    for prob_field in [
        "stop_scroll",
        "watch_probability",
        "completion_probability",
        "like_probability",
        "comment_probability",
        "share_probability",
        "save_probability",
        "follow_probability",
    ]:
        bad_kwargs = dict(valid_kwargs)
        bad_kwargs[prob_field] = 1.05
        with pytest.raises(ValidationError):
            Reaction(**bad_kwargs)

        bad_kwargs[prob_field] = -0.01
        with pytest.raises(ValidationError):
            Reaction(**bad_kwargs)


def test_reaction_missing_required_fields():
    """Test that missing required fields raise ValidationError."""
    # Missing reasoning
    with pytest.raises(ValidationError):
        Reaction(
            persona_name="Test",
            stop_scroll=0.5,
            watch_probability=0.5,
            completion_probability=0.5,
            like_probability=0.5,
            comment_probability=0.5,
            share_probability=0.5,
            save_probability=0.5,
            follow_probability=0.5,
        )

    # Missing stop_scroll
    with pytest.raises(ValidationError):
        Reaction(
            persona_name="Test",
            watch_probability=0.5,
            completion_probability=0.5,
            like_probability=0.5,
            comment_probability=0.5,
            share_probability=0.5,
            save_probability=0.5,
            follow_probability=0.5,
            reasoning="Reasoning without stop scroll",
        )
