"""
Unit tests for explainable scoring logic, signal attributions, formula breakdown, and retention funnel.
"""

from virality_lab.core.content import Platform
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.explanation import ExplanationEngine
from virality_lab.scoring.schemas import (
    ComponentScores,
    MetricDistribution,
)


def test_signal_attributions_detection():
    engine = ExplanationEngine()
    caption = "Stop scrolling! 3 AI tools that will save you 10 hours this week. Save this for later!"
    signals = engine.extract_signal_attributions(caption=caption, platform="tiktok")

    signal_ids = [s.signal_id for s in signals]
    assert "sig_pattern_interrupt" in signal_ids
    assert "sig_numerical_specificity" in signal_ids
    assert "sig_save_cta" in signal_ids

    # Check that impact points and rationales are provided
    for s in signals:
        assert s.impact_points != 0
        assert len(s.rationale) > 10
        assert s.confidence > 0.5


def test_formula_breakdown():
    engine = ExplanationEngine()
    components = ComponentScores(retention=80.0, sharing=70.0, engagement=60.0, conversion=50.0)
    weights = {"retention": 0.45, "sharing": 0.25, "engagement": 0.15, "conversion": 0.15}

    fb = engine.generate_formula_breakdown(
        components=components,
        platform_weights=weights,
        overall_score=70.0,
        platform="tiktok",
    )

    assert "Score =" in fb.formula_equation
    assert fb.raw_weighted_sum == round(80 * 0.45 + 70 * 0.25 + 60 * 0.15 + 50 * 0.15, 2)
    assert fb.platform_weights == weights


def test_retention_funnel_generation():
    engine = ExplanationEngine()
    components = ComponentScores(retention=75.0, sharing=60.0, engagement=65.0, conversion=55.0)
    raw_metrics = {
        "stop_scroll": MetricDistribution(mean=0.82, median=0.82, std_dev=0.08, min_val=0.6, max_val=0.95),
        "watch_probability": MetricDistribution(mean=0.68, median=0.68, std_dev=0.10, min_val=0.4, max_val=0.85),
        "completion_probability": MetricDistribution(mean=0.52, median=0.52, std_dev=0.12, min_val=0.3, max_val=0.75),
        "share_probability": MetricDistribution(mean=0.38, median=0.38, std_dev=0.09, min_val=0.2, max_val=0.6),
    }

    funnel = engine.generate_retention_funnel(raw_metrics=raw_metrics, components=components)
    assert len(funnel) == 6
    assert funnel[0].retention_percentage == 100.0
    for step in funnel:
        assert step.dropoff_percentage >= 0.0
        assert step.retention_percentage >= 0.0
        assert len(step.friction_note) > 5


def test_virality_scoring_engine_full_explainability():
    scoring_engine = ViralityScoringEngine()
    sim_result = SimulationResult(
        content_id="test_exp_1",
        total_agents=2,
        reactions=[
            Reaction(
                persona_id="p1",
                persona_name="Gen-Z Student",
                content_id="test_exp_1",
                stop_scroll=0.85,
                watch_probability=0.75,
                completion_probability=0.60,
                like_probability=0.70,
                comment_probability=0.50,
                share_probability=0.65,
                save_probability=0.80,
                follow_probability=0.40,
                emotional_response="excited",
                reasoning="Hook was immediate and high utility.",
                strengths=["Great hook", "Clear actionable steps"],
                weaknesses=[],
            ),
            Reaction(
                persona_id="p2",
                persona_name="Tech Skeptic",
                content_id="test_exp_1",
                stop_scroll=0.70,
                watch_probability=0.60,
                completion_probability=0.50,
                like_probability=0.45,
                comment_probability=0.30,
                share_probability=0.40,
                save_probability=0.60,
                follow_probability=0.25,
                emotional_response="skeptical",
                reasoning="Solid numbers disproved skepticism.",
                strengths=["Concrete numbers"],
                weaknesses=["Slightly hyperbolic"],
            ),
        ],
    )

    score = scoring_engine.score(sim_result, platform=Platform.TIKTOK)
    assert score.overall_score > 0
    assert score.formula_breakdown is not None
    assert len(score.retention_funnel) == 6
    assert score.formula_breakdown.platform_weights["retention"] == 0.40
