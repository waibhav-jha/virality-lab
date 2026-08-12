"""
Top-Level ViralityLabEngine Facade.
Coordinating Content Analysis, Audience Simulation, Virality Scoring,
Diagnostics, Optimization, and Winner Selection across all pipeline modes.
"""

from datetime import datetime, timezone
from enum import Enum
import logging
from typing import Any, Callable, Dict, List, Optional
import uuid

from virality_lab.analyzer.base import ContentAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.config.app_config import AppConfig
from virality_lab.config.loader import (
    create_default_agents,
    load_optimization_config,
    load_scoring_config,
)
from virality_lab.core.content import Content
from virality_lab.core.simulation import SimulationEngine, SimulationResult
from virality_lab.optimizer.config import OptimizationConfig
from virality_lab.optimizer.engine import OptimizationEngine
from virality_lab.optimizer.generator import BaseContentOptimizer, LLMContentOptimizer, MockContentOptimizer
from virality_lab.optimizer.schemas import OptimizationObjective, OptimizationResult
from virality_lab.scoring.config import ScoringConfig
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.schemas import ViralityScore
from virality_lab.storage.cache import AnalysisCache, MemoryAnalysisCache
from virality_lab.storage.runs import (
    JobStatus,
    MemoryRunStore,
    PipelineStage,
    RunStore,
    ViralityJob,
)

logger = logging.getLogger("virality_lab.engine")


class PipelineMode(str, Enum):
    """Execution mode for the ViralityLabEngine pipeline."""

    ANALYZE_ONLY = "analyze_only"
    SIMULATE = "simulate"
    SCORE = "score"
    OPTIMIZE = "optimize"
    FULL = "full"


def generate_run_id() -> str:
    """Generate a clean, uniform, human-readable run ID (e.g. vl_20260812_a81f92)."""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6]
    return f"vl_{date_str}_{short_uuid}"


class ViralityLabEngine:
    """
    Unified Application Facade coordinating the full Virality Lab pipeline.
    """

    def __init__(
        self,
        analyzer: Optional[ContentAnalyzer] = None,
        simulation_engine: Optional[SimulationEngine] = None,
        scoring_engine: Optional[ViralityScoringEngine] = None,
        optimization_engine: Optional[OptimizationEngine] = None,
        run_store: Optional[RunStore] = None,
        cache: Optional[AnalysisCache] = None,
        config: Optional[AppConfig] = None,
    ) -> None:
        self.config = config or AppConfig.from_env()
        self.analyzer = analyzer or LocalContentAnalyzer()

        # Simulation Engine setup
        if simulation_engine is not None:
            self.simulation_engine = simulation_engine
        else:
            agent_type = "mock" if self.config.simulation_mode == "mock" else "llm"
            provider = None
            if agent_type == "llm":
                from virality_lab.llm.factory import get_llm_provider
                provider = get_llm_provider(
                    provider_type=self.config.llm_provider,
                    model_name=self.config.llm_model,
                )
            agents = create_default_agents(agent_type=agent_type, provider=provider)
            self.simulation_engine = SimulationEngine(agents=agents)

        # Scoring Engine setup
        scoring_cfg = load_scoring_config(self.config.scoring_config_path) if self.config.scoring_config_path else load_scoring_config()
        self.scoring_engine = scoring_engine or ViralityScoringEngine(config=scoring_cfg)

        # Optimization Engine setup
        if optimization_engine is not None:
            self.optimization_engine = optimization_engine
        else:
            opt_cfg = load_optimization_config(self.config.optimization_config_path) if self.config.optimization_config_path else load_optimization_config()
            generator: BaseContentOptimizer = MockContentOptimizer() if self.config.simulation_mode == "mock" else LLMContentOptimizer(
                provider=self.simulation_engine.agents[0].provider if hasattr(self.simulation_engine.agents[0], "provider") else None
            )
            self.optimization_engine = OptimizationEngine(
                simulation_engine=self.simulation_engine,
                scoring_engine=self.scoring_engine,
                analyzer=self.analyzer,
                generator=generator,
                config=opt_cfg,
            )

        self.run_store = run_store or MemoryRunStore()
        self.cache = cache or MemoryAnalysisCache()

    @classmethod
    def from_config(cls, config: Optional[AppConfig] = None) -> "ViralityLabEngine":
        """Factory creating engine from AppConfig."""
        cfg = config or AppConfig.from_env()
        return cls(config=cfg)

    def analyze(self, content: Content, run_id: Optional[str] = None) -> ContentProfile:
        """Run Content Intelligence Layer only."""
        return self.analyzer.analyze(content)

    def simulate(
        self,
        content: Content,
        profile: Optional[ContentProfile] = None,
        persona_names: Optional[List[str]] = None,
        run_id: Optional[str] = None,
    ) -> SimulationResult:
        """Run Audience Simulation Layer."""
        if profile is None:
            profile = self.analyze(content, run_id=run_id)

        # Optional persona sub-selection
        if persona_names:
            filtered_agents = [a for a in self.simulation_engine.agents if a.persona.name in persona_names]
            if filtered_agents:
                temp_engine = SimulationEngine(agents=filtered_agents)
                return temp_engine.run(content=content)

        return self.simulation_engine.run(content=content)

    def score(
        self,
        simulation_result: SimulationResult,
        profile: Optional[ContentProfile] = None,
        platform: Optional[Any] = None,
        run_id: Optional[str] = None,
    ) -> ViralityScore:
        """Calculate Virality Score & Diagnostics from simulation results."""
        return self.scoring_engine.score(
            simulation_result=simulation_result,
            profile=profile,
            platform=platform,
        )

    def optimize(
        self,
        content: Content,
        profile: Optional[ContentProfile] = None,
        simulation: Optional[SimulationResult] = None,
        score: Optional[ViralityScore] = None,
        objective: Optional[OptimizationObjective] = None,
        iterations: Optional[int] = None,
        run_id: Optional[str] = None,
    ) -> OptimizationResult:
        """Run Content Optimization Engine to generate and evaluate candidate variants."""
        return self.optimization_engine.optimize(
            content=content,
            profile=profile,
            simulation=simulation,
            score=score,
            objective=objective,
            max_iterations=iterations,
        )

    def run(
        self,
        content: Content,
        mode: PipelineMode = PipelineMode.FULL,
        objective: Optional[OptimizationObjective] = None,
        optimization_enabled: bool = True,
        optimization_iterations: Optional[int] = None,
        target_audience: Optional[str] = None,
        persona_weights: Optional[Dict[str, float]] = None,
        persona_names: Optional[List[str]] = None,
        run_id: Optional[str] = None,
        progress_callback: Optional[Callable[[PipelineStage, int, str], None]] = None,
    ) -> Dict[str, Any]:
        """
        Execute the end-to-end Virality Lab pipeline.

        Returns a dictionary representation of the comprehensive run result.
        """
        active_run_id = run_id or generate_run_id()
        self.run_store.create_job(
            run_id=active_run_id,
            request_data={
                "content_id": content.id,
                "platform": content.platform.value,
                "mode": mode.value,
                "optimization_enabled": optimization_enabled,
            },
        )

        def _update_stage(stage: PipelineStage, progress: int, message: str) -> None:
            self.run_store.update_job(
                run_id=active_run_id,
                status=JobStatus.PROCESSING,
                stage=stage,
                progress=progress,
                message=message,
            )
            if progress_callback:
                progress_callback(stage, progress, message)

        try:
            # 1. Content Analysis
            _update_stage(PipelineStage.ANALYZING, 15, "Analyzing content intelligence & stylistic signals.")
            profile = self.analyze(content, run_id=active_run_id)

            _update_stage(PipelineStage.BUILDING_PROFILE, 30, "Extracted multi-modal profile and engagement signals.")
            if mode == PipelineMode.ANALYZE_ONLY:
                res = {
                    "run_id": active_run_id,
                    "content": content.model_dump(),
                    "content_profile": profile.model_dump(),
                    "status": "completed",
                }
                self.run_store.update_job(
                    run_id=active_run_id,
                    status=JobStatus.COMPLETED,
                    stage=PipelineStage.COMPLETED,
                    progress=100,
                    message="Content analysis completed.",
                    result_data=res,
                )
                return res

            # 2. Audience Simulation
            _update_stage(PipelineStage.SIMULATING, 50, f"Simulating audience reactions across {len(self.simulation_engine.agents)} personas.")
            sim_result = self.simulate(content=content, profile=profile, persona_names=persona_names, run_id=active_run_id)

            if mode == PipelineMode.SIMULATE:
                res = {
                    "run_id": active_run_id,
                    "content": content.model_dump(),
                    "content_profile": profile.model_dump(),
                    "simulation": sim_result.model_dump(),
                    "status": "completed",
                }
                self.run_store.update_job(
                    run_id=active_run_id,
                    status=JobStatus.COMPLETED,
                    stage=PipelineStage.COMPLETED,
                    progress=100,
                    message="Audience simulation completed.",
                    result_data=res,
                )
                return res

            # 3. Virality Scoring & Diagnostics
            _update_stage(PipelineStage.SCORING, 70, "Computing normalized virality score, breakdown, and friction points.")
            score = self.score(
                simulation_result=sim_result,
                profile=profile,
                platform=content.platform,
                run_id=active_run_id,
            )

            if mode == PipelineMode.SCORE or not optimization_enabled:
                res = {
                    "run_id": active_run_id,
                    "content": content.model_dump(),
                    "content_profile": profile.model_dump(),
                    "simulation": sim_result.model_dump(),
                    "score": score.model_dump(),
                    "status": "completed",
                }
                self.run_store.update_job(
                    run_id=active_run_id,
                    status=JobStatus.COMPLETED,
                    stage=PipelineStage.COMPLETED,
                    progress=100,
                    message="Virality scoring completed.",
                    result_data=res,
                )
                return res

            # 4. Content Optimization & Candidate Simulation
            _update_stage(PipelineStage.OPTIMIZING, 85, "Generating targeted variants addressing identified bottlenecks.")
            opt_result = self.optimize(
                content=content,
                profile=profile,
                simulation=sim_result,
                score=score,
                objective=objective or OptimizationObjective.OVERALL,
                iterations=optimization_iterations or self.config.optimization_iterations,
                run_id=active_run_id,
            )

            _update_stage(PipelineStage.SELECTING_WINNER, 95, "Evaluating variant simulation deltas and guardrails.")

            # 5. Assemble Full Output
            full_res = {
                "run_id": active_run_id,
                "content": content.model_dump(),
                "content_profile": profile.model_dump(),
                "simulation": sim_result.model_dump(),
                "score": score.model_dump(),
                "optimization": opt_result.model_dump(),
                "best_content": opt_result.best_content.model_dump(),
                "best_score": opt_result.best_score.model_dump(),
                "overall_improvement": opt_result.overall_improvement,
                "status": "completed",
            }

            self.run_store.update_job(
                run_id=active_run_id,
                status=JobStatus.COMPLETED,
                stage=PipelineStage.COMPLETED,
                progress=100,
                message="Pipeline execution completed successfully.",
                result_data=full_res,
            )
            return full_res

        except Exception as exc:
            logger.exception("Pipeline execution failed for run %s: %s", active_run_id, str(exc))
            err_data = {
                "code": "PIPELINE_EXECUTION_FAILED",
                "message": str(exc),
                "run_id": active_run_id,
            }
            self.run_store.update_job(
                run_id=active_run_id,
                status=JobStatus.FAILED,
                stage=PipelineStage.FAILED,
                progress=100,
                message=f"Failed: {str(exc)}",
                error_data=err_data,
            )
            raise
