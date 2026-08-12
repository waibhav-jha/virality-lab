"""
Unit tests for VariantEvaluator and regression guardrail auditing.
"""

from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.config.loader import create_default_agents
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.simulation import SimulationEngine
from virality_lab.optimizer.config import GuardrailConfig
from virality_lab.optimizer.evaluator import VariantEvaluator
from virality_lab.optimizer.schemas import ContentVariant, OptimizationTarget
from virality_lab.scoring.engine import ViralityScoringEngine
from tests.test_optimization_schemas import _make_dummy_virality_score


def test_variant_evaluator_runs_pipeline_and_computes_deltas():
    """Verify VariantEvaluator executes complete analysis, simulation, and scoring pipeline."""
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    scoring_engine = ViralityScoringEngine()
    analyzer = LocalContentAnalyzer()
    evaluator = VariantEvaluator(
        simulation_engine=sim_engine,
        scoring_engine=scoring_engine,
        analyzer=analyzer,
    )

    orig_content = Content(id="orig-01", caption="5 AI tools for students")
    var_content = orig_content.model_copy(
        update={"id": "orig-01_var-01", "caption": "Still doing this manually? 5 AI tools for students"}
    )
    variant = ContentVariant(
        variant_id="var-01",
        parent_content_id=orig_content.id,
        optimization_target=OptimizationTarget.HOOK,
        strategy_name="HookOptimizationStrategy",
        changes=["Added hook question"],
        reason="Low stop scroll",
        content=var_content,
    )

    baseline_score = scoring_engine.score(sim_engine.run(orig_content))
    evaluated = evaluator.evaluate_variant(variant, baseline_score=baseline_score)

    assert evaluated.variant.variant_id == "var-01"
    assert evaluated.score.overall_score >= 0.0
    assert evaluated.comparison.absolute_change is not None
    assert evaluated.guardrail_passed is True


def test_variant_evaluator_guardrail_rejections():
    """Verify guardrails reject variants with excessive retention drops or overall regressions."""
    guardrails = GuardrailConfig(
        max_retention_drop_pct=10.0,
        max_component_drop_points=10.0,
        require_positive_overall=True,
    )
    agents = create_default_agents(agent_type="mock")
    evaluator = VariantEvaluator(
        simulation_engine=SimulationEngine(agents=agents),
        scoring_engine=ViralityScoringEngine(),
        guardrail_config=guardrails,
    )

    # Test baseline 70 vs variant 50 (overall drop)
    baseline_high = _make_dummy_virality_score(70.0, retention=80.0, sharing=70.0)
    variant_low = _make_dummy_virality_score(50.0, retention=40.0, sharing=50.0)
    comparison = evaluator._build_comparison(baseline_high, variant_low)
    passed, rejections = evaluator._check_guardrails(baseline_high, variant_low, comparison)

    assert passed is False
    assert any("Overall virality potential decreased" in r for r in rejections)
    assert any("Retention dropped" in r for r in rejections)
