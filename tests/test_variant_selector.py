"""
Unit tests for VariantSelector ranking and deterministic tie-breaking.
"""

from virality_lab.core.content import Content
from virality_lab.optimizer.schemas import (
    ContentVariant,
    EvaluatedVariant,
    OptimizationComparison,
    OptimizationObjective,
    OptimizationTarget,
)
from virality_lab.optimizer.selector import VariantSelector
from tests.test_optimization_schemas import _make_dummy_virality_score


def _make_eval_variant(vid: str, score_val: float, retention: float, sharing: float, passed: bool = True, delta: float = 3.0) -> EvaluatedVariant:
    content = Content(id=f"c_{vid}", caption="text")
    var = ContentVariant(
        variant_id=vid,
        parent_content_id="c_orig",
        optimization_target=OptimizationTarget.HOOK,
        strategy_name="HookOptimizationStrategy",
        changes=["Change 1"],
        reason="Reason",
        content=content,
    )
    score = _make_dummy_virality_score(score_val, retention=retention, sharing=sharing)
    comp = OptimizationComparison(
        original_score=score_val - delta,
        variant_score=score_val,
        absolute_change=delta,
        relative_change=5.0,
        component_changes={"retention": delta, "sharing": delta},
    )
    return EvaluatedVariant(
        variant=var,
        simulation_result=None,  # Not used in selector
        score=score,
        comparison=comp,
        guardrail_passed=passed,
    )


def test_variant_selector_selects_highest_overall():
    """Verify VariantSelector selects variant with highest overall improvement."""
    selector = VariantSelector(minimum_improvement=2.0)
    v1 = _make_eval_variant("v1", 62.0, retention=60.0, sharing=50.0, delta=2.0)
    v2 = _make_eval_variant("v2", 68.0, retention=70.0, sharing=60.0, delta=8.0)
    v3 = _make_eval_variant("v3", 64.0, retention=65.0, sharing=55.0, delta=4.0)

    winner = selector.select_winner([v1, v2, v3], objective=OptimizationObjective.OVERALL)
    assert winner is not None
    assert winner.variant.variant_id == "v2"


def test_variant_selector_ignores_failed_guardrails():
    """Verify VariantSelector skips candidates that failed regression guardrails."""
    selector = VariantSelector(minimum_improvement=2.0)
    # v1 has high score but failed guardrail
    v1 = _make_eval_variant("v1", 75.0, retention=80.0, sharing=80.0, passed=False, delta=15.0)
    v2 = _make_eval_variant("v2", 64.0, retention=65.0, sharing=55.0, passed=True, delta=4.0)

    winner = selector.select_winner([v1, v2], objective=OptimizationObjective.OVERALL)
    assert winner is not None
    assert winner.variant.variant_id == "v2"


def test_variant_selector_enforces_minimum_improvement():
    """Verify VariantSelector returns None when no candidate meets improvement threshold."""
    selector = VariantSelector(minimum_improvement=5.0)
    v1 = _make_eval_variant("v1", 61.0, retention=60.0, sharing=50.0, delta=1.0)
    v2 = _make_eval_variant("v2", 62.0, retention=60.0, sharing=50.0, delta=2.0)

    winner = selector.select_winner([v1, v2], objective=OptimizationObjective.OVERALL)
    assert winner is None


def test_variant_selector_prioritizes_shares_objective():
    """Verify VariantSelector ranks by sharing component when objective=SHARES."""
    selector = VariantSelector(minimum_improvement=2.0)
    # v1 has higher overall (70 vs 68) but lower sharing (50 vs 85)
    v1 = _make_eval_variant("v1", 70.0, retention=80.0, sharing=50.0, delta=5.0)
    v2 = _make_eval_variant("v2", 68.0, retention=60.0, sharing=85.0, delta=3.0)

    winner = selector.select_winner([v1, v2], objective=OptimizationObjective.SHARES)
    assert winner is not None
    assert winner.variant.variant_id == "v2"
