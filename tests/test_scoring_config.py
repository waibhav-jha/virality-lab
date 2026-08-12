"""
Unit tests for ScoringConfig and platform modifier logic.
"""

import pytest
from virality_lab.core.content import Platform
from virality_lab.scoring.config import MetricSubWeights, ScoringConfig


def test_default_scoring_config_validity():
    """Verify default ScoringConfig initialized with valid normalized weights."""
    config = ScoringConfig()
    assert abs(sum(config.component_weights.values()) - 1.0) < 0.001
    assert "retention" in config.component_weights
    assert "sharing" in config.component_weights
    assert "engagement" in config.component_weights
    assert "conversion" in config.component_weights


def test_scoring_config_invalid_component_sum():
    """Verify component weights that do not sum to 1.0 raise ValueError."""
    with pytest.raises(ValueError) as exc:
        ScoringConfig(
            component_weights={
                "retention": 0.50,
                "sharing": 0.50,
                "engagement": 0.50,
                "conversion": 0.50,
            }
        )
    assert "must sum to 1.0" in str(exc.value)


def test_scoring_config_negative_weights():
    """Verify negative weights raise ValueError."""
    with pytest.raises(ValueError) as exc:
        ScoringConfig(
            component_weights={
                "retention": 1.20,
                "sharing": -0.20,
                "engagement": 0.0,
                "conversion": 0.0,
            }
        )
    assert "cannot be negative" in str(exc.value)


def test_metric_subweights_validation():
    """Verify metric sub-weights validation enforces sum to 1.0 per block."""
    with pytest.raises(ValueError) as exc:
        MetricSubWeights(retention={"stop_scroll": 0.5, "watch": 0.1})
    assert "must sum to 1.0" in str(exc.value)


def test_platform_modifiers_lookup():
    """Verify platform specific overrides are correctly retrieved."""
    config = ScoringConfig()

    # TikTok prioritizes retention
    tt_w = config.get_component_weights(Platform.TIKTOK)
    assert tt_w["retention"] == 0.40

    # Instagram Reels prioritizes sharing
    ig_w = config.get_component_weights(Platform.INSTAGRAM_REELS)
    assert ig_w["sharing"] == 0.35

    # LinkedIn prioritizes engagement
    li_w = config.get_component_weights(Platform.LINKEDIN)
    assert li_w["engagement"] == 0.40

    # None / Unknown falls back to base component_weights
    base_w = config.get_component_weights(None)
    assert base_w == config.component_weights


def test_persona_weights_equal_and_custom():
    """Verify default equal persona weighting and custom normalization."""
    config = ScoringConfig()
    personas = ["Gen-Z Student", "Casual Scroller", "Skeptic"]

    # Default equal weights
    eq_weights = config.get_persona_weights(personas)
    assert len(eq_weights) == 3
    for w in eq_weights.values():
        assert pytest.approx(w, 0.001) == 1.0 / 3.0

    # Custom weights
    custom_cfg = ScoringConfig(
        persona_weights={
            "Gen-Z Student": 3.0,
            "Casual Scroller": 1.0,
            "Skeptic": 0.0,
        }
    )
    cust_w = custom_cfg.get_persona_weights(personas)
    assert cust_w["Gen-Z Student"] == 0.75
    assert cust_w["Casual Scroller"] == 0.25
    assert cust_w["Skeptic"] == 0.0


def test_scoring_config_from_yaml():
    """Verify ScoringConfig loads cleanly from config/scoring.yaml."""
    cfg = ScoringConfig.from_yaml()
    assert isinstance(cfg, ScoringConfig)
    assert cfg.component_weights["retention"] == 0.35
    assert cfg.component_weights["sharing"] == 0.30
