"""
Unit tests for the ReactionAggregator component.
"""

import pytest

from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.engine.aggregator import AggregateReaction, ReactionAggregator


def test_aggregator_statistical_accuracy():
    """Test that ReactionAggregator computes correct means and extremes."""
    r1 = Reaction(
        persona_name="Persona A",
        stop_scroll=0.80,
        watch_probability=0.70,
        completion_probability=0.60,
        like_probability=0.50,
        comment_probability=0.40,
        share_probability=0.90,
        save_probability=0.30,
        follow_probability=0.20,
        emotional_response="entertained",
        strengths=["Strong visual hook"],
        weaknesses=["Too long"],
        reasoning="Good video.",
    )
    r2 = Reaction(
        persona_name="Persona B",
        stop_scroll=0.60,
        watch_probability=0.50,
        completion_probability=0.40,
        like_probability=0.30,
        comment_probability=0.20,
        share_probability=0.50,
        save_probability=0.10,
        follow_probability=0.10,
        emotional_response="skeptical",
        strengths=["Clear audio"],
        weaknesses=["Needs proof"],
        reasoning="Okay video.",
    )

    sim_result = SimulationResult(
        content_id="test-content-123",
        reactions=[r1, r2],
    )

    aggregator = ReactionAggregator()
    agg = aggregator.aggregate(sim_result)

    assert isinstance(agg, AggregateReaction)
    assert agg.content_id == "test-content-123"
    assert agg.total_reactions == 2

    # Verify exact averages
    assert agg.mean_stop_scroll == pytest.approx(0.70, 0.001)
    assert agg.mean_watch_probability == pytest.approx(0.60, 0.001)
    assert agg.mean_completion_probability == pytest.approx(0.50, 0.001)
    assert agg.mean_like_probability == pytest.approx(0.40, 0.001)
    assert agg.mean_comment_probability == pytest.approx(0.30, 0.001)
    assert agg.mean_share_probability == pytest.approx(0.70, 0.001)

    # Verify extremes
    assert agg.min_stop_scroll == 0.60
    assert agg.max_stop_scroll == 0.80
    assert agg.min_share_probability == 0.50
    assert agg.max_share_probability == 0.90

    # Verify qualitative consensus
    assert agg.dominant_emotions == {"entertained": 1, "skeptical": 1}
    assert "Strong visual hook" in agg.consensus_strengths
    assert "Clear audio" in agg.consensus_strengths
    assert "Too long" in agg.consensus_weaknesses
    assert "Needs proof" in agg.consensus_weaknesses


def test_aggregator_empty_reactions():
    """Test that aggregating a SimulationResult with no reactions raises ValueError."""
    sim_result = SimulationResult(
        content_id="empty-content",
        reactions=[],
    )

    aggregator = ReactionAggregator()
    with pytest.raises(ValueError, match="Cannot aggregate empty reaction list"):
        aggregator.aggregate(sim_result)


def test_aggregator_invalid_input_type():
    """Test that passing an invalid type raises TypeError."""
    aggregator = ReactionAggregator()
    with pytest.raises(TypeError, match="Expected SimulationResult"):
        aggregator.aggregate({"reactions": []})  # type: ignore
