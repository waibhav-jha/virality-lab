"""
Integration and end-to-end tests for OptimizationEngine.
"""

from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.config.loader import create_default_agents
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.simulation import SimulationEngine
from virality_lab.llm.base import LLMProvider, LLMResponse
from virality_lab.optimizer.config import OptimizationConfig
from virality_lab.optimizer.engine import OptimizationEngine
from virality_lab.optimizer.generator import LLMContentOptimizer, MockContentOptimizer
from virality_lab.optimizer.schemas import OptimizationObjective
from virality_lab.scoring.engine import ViralityScoringEngine


class MockLLMProvider(LLMProvider):
    """Deterministic LLM Provider for optimizer testing."""

    def __init__(self) -> None:
        super().__init__(model_name="mock-llm-optimizer")

    def generate(self, system_prompt: str, user_prompt: str, **kwargs) -> LLMResponse:
        content = """{
            "new_hook": "Are you still studying the hard way in 2026?",
            "full_caption": "Are you still studying the hard way in 2026? 5 AI tools every college student should know. Save this! #productivity",
            "full_transcript": "Are you still studying the hard way in 2026? Here are 5 AI tools.",
            "change_summary": "Replaced opening with high-contrast curiosity question",
            "rationale": "Addressed low stop-scroll metric"
        }"""
        return LLMResponse(content=content, model_name=self.model_name, usage={"total_tokens": 50})

    async def generate_async(self, system_prompt: str, user_prompt: str, **kwargs) -> LLMResponse:
        return self.generate(system_prompt, user_prompt, **kwargs)


def test_optimization_engine_end_to_end_mock():
    """Verify OptimizationEngine with MockContentOptimizer produces improved winner and full audit log."""
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    scoring_engine = ViralityScoringEngine()
    analyzer = LocalContentAnalyzer()
    config = OptimizationConfig(max_iterations=1, variants_per_iteration=3, minimum_improvement=2.0)

    engine = OptimizationEngine(
        simulation_engine=sim_engine,
        scoring_engine=scoring_engine,
        analyzer=analyzer,
        generator=MockContentOptimizer(),
        config=config,
    )

    content = Content(
        id="college-ai-post",
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="5 AI tools for students",
        transcript="Hey guys today I will show you 5 tools.",
    )

    result = engine.optimize(content, objective=OptimizationObjective.OVERALL)

    assert result.original_content.id == "college-ai-post"
    assert len(result.history) == 1
    assert result.history[0].iteration_index == 0
    assert len(result.history[0].evaluated_variants) == 3
    assert result.best_variant is not None
    assert result.overall_improvement >= 2.0
    assert result.best_content.id != "college-ai-post"
    assert "mock-var" in result.best_content.id


def test_optimization_engine_end_to_end_llm():
    """Verify OptimizationEngine with LLMContentOptimizer generates valid variant using provider."""
    agents = create_default_agents(agent_type="mock")
    sim_engine = SimulationEngine(agents=agents)
    scoring_engine = ViralityScoringEngine()
    analyzer = LocalContentAnalyzer()
    config = OptimizationConfig(max_iterations=1, variants_per_iteration=1, minimum_improvement=0.5)

    llm_generator = LLMContentOptimizer(provider=MockLLMProvider())
    engine = OptimizationEngine(
        simulation_engine=sim_engine,
        scoring_engine=scoring_engine,
        analyzer=analyzer,
        generator=llm_generator,
        config=config,
    )

    content = Content(
        id="test-post-llm",
        platform=Platform.TIKTOK,
        media_type=MediaType.SHORT_VIDEO,
        caption="Normal post caption",
    )

    result = engine.optimize(content)
    assert len(result.history) == 1
    assert len(result.history[0].evaluated_variants) == 1
    variant = result.history[0].evaluated_variants[0].variant
    assert "Are you still studying" in variant.content.caption
    assert variant.parent_content_id == "test-post-llm"
