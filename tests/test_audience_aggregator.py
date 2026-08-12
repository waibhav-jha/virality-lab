"""
Unit tests for AudienceAggregator statistical distributions and agreement metrics.
"""

import pytest
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.aggregator import AudienceAggregator


def _create_sample_reaction(persona_name: str, stop: float, share: float) -> Reaction:
    return Reaction(
        persona_id=f"id-{persona_name}",
        persona_name=persona_name,
        content_id="test-c1",
        stop_scroll=stop,
        watch_probability=0.70,
        completion_probability=0.60,
        like_probability=0.50,
        comment_probability=0.20,
        share_probability=share,
        save_probability=0.40,
        follow_probability=0.10,
        emotional_response="curious",
        reasoning="Test reasoning",
        strengths=[f"{persona_name} strength 1"],
        weaknesses=[f"{persona_name} weakness 1"],
    )


def test_audience_aggregator_distributions():
    """Verify statistical distributions (mean, median, min, max, std_dev) across reactions."""
    agg = AudienceAggregator()
    reactions = [
        _create_sample_reaction("P1", stop=0.80, share=0.60),
        _create_sample_reaction("P2", stop=0.90, share=0.40),
        _create_sample_reaction("P3", stop=0.70, share=0.80),
    ]

    dist = agg.aggregate_distributions(reactions)
    assert "stop_scroll" in dist
    assert "share_probability" in dist

    # Mean stop scroll = (0.8 + 0.9 + 0.7) / 3 = 0.80
    assert pytest.approx(dist["stop_scroll"].mean, 0.001) == 0.80
    assert pytest.approx(dist["stop_scroll"].median, 0.001) == 0.80
    assert dist["stop_scroll"].min_val == 0.70
    assert dist["stop_scroll"].max_val == 0.90
    assert dist["stop_scroll"].std_dev > 0.0


def test_audience_aggregator_empty_raises():
    """Verify aggregating empty reaction list raises ValueError."""
    agg = AudienceAggregator()
    with pytest.raises(ValueError):
        agg.aggregate_distributions([])


def test_audience_agreement_and_polarization():
    """Verify agreement calculation for uniform vs polarized audience scores."""
    agg = AudienceAggregator()

    # Uniform consensus (low variance)
    uniform_scores = [80.0, 81.0, 79.0, 80.5, 80.0]
    agreement_uni = agg.calculate_agreement(uniform_scores)
    assert agreement_uni.agreement_score >= 0.90
    assert agreement_uni.polarization_score <= 0.10
    assert agreement_uni.level == "high"

    # Highly polarized audience (large spread between 90 and 20)
    polarized_scores = [95.0, 90.0, 88.0, 20.0, 15.0]
    agreement_pol = agg.calculate_agreement(polarized_scores)
    assert agreement_pol.agreement_score < 0.50
    assert agreement_pol.polarization_score > 0.50
    assert agreement_pol.level == "polarized"


def test_simulation_coverage_and_confidence():
    """Verify confidence metrics when all agents succeed vs partial failure."""
    agg = AudienceAggregator()

    # 5/5 evaluated
    reactions = [_create_sample_reaction(f"P{i}", 0.8, 0.5) for i in range(5)]
    full_res = SimulationResult(
        content_id="c1",
        reactions=reactions,
        total_agents=5,
    )
    conf_full = agg.calculate_confidence(full_res)
    assert conf_full.simulation_coverage == 1.0
    assert conf_full.evaluated_agents == 5
    assert conf_full.expected_agents == 5
    assert conf_full.uncertainty_level == "low"

    # 3/5 evaluated (2 failed)
    partial_res = SimulationResult(
        content_id="c1",
        reactions=reactions[:3],
        total_agents=5,
    )
    conf_part = agg.calculate_confidence(partial_res)
    assert conf_part.simulation_coverage == 0.6
    assert conf_part.uncertainty_level == "high"
    assert any("failed" in n for n in conf_part.notes)
