"""
Top-level Orchestrator coordinating the Virality Lab pipeline:
Content -> Audience Simulation -> Raw Reactions -> Aggregation -> Virality Score.
Designed with explicit plug-and-play extension points for Content Analyzer and Optimizer components.
"""

from typing import Any, Callable, Dict, List, Optional
from pydantic import BaseModel, Field

from virality_lab.core.content import Content
from virality_lab.core.scoring import ScoringEngine, ViralityScoreBreakdown
from virality_lab.core.simulation import SimulationEngine, SimulationResult
from virality_lab.engine.aggregator import AggregateReaction, ReactionAggregator
from virality_lab.scoring.calibration import BaseScoringEngine
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.schemas import ViralityScore


class ViralityEngineResult(BaseModel):
    """
    Comprehensive output of a full Virality Lab run.
    Contains the source content, all raw individual reactions, statistical aggregate, and score breakdown.
    """

    content: Content = Field(..., description="The tested content asset.")
    simulation_result: SimulationResult = Field(..., description="Raw persona reactions and execution details.")
    aggregate_reaction: AggregateReaction = Field(..., description="Statistical audience-level summary.")
    score_breakdown: ViralityScoreBreakdown = Field(..., description="Virality potential breakdown (legacy 0-100 scale).")
    virality_score: Optional[ViralityScore] = Field(default=None, description="Part 5 ViralityScore with complete intelligence breakdown.")

    def print_summary(self) -> None:
        """Print a human-readable CLI summary of the simulation results."""
        if self.virality_score:
            print(self.virality_score.render_ascii_report())
            return

        print("=" * 70)
        print("VIRALITY LAB SIMULATION COMPLETE")
        print(f"Content ID: {self.content.id} | Platform: {self.content.platform.value} | Type: {self.content.media_type.value}")
        if self.content.caption:
            print(f"Caption: \"{self.content.caption}\"")
        print("=" * 70)
        print("\nINDIVIDUAL PERSONA REACTIONS:")
        print(f"{'PERSONA':<22} | {'STOP SCROLL':<11} | {'WATCH':<8} | {'SHARE':<8} | {'EMOTION'}")
        print("-" * 70)
        for r in self.simulation_result.reactions:
            print(f"{r.persona_name:<22} | {r.stop_scroll:<11.2f} | {r.watch_probability:<8.2f} | {r.share_probability:<8.2f} | {r.emotional_response}")

        print("-" * 70)
        print(f"\nAUDIENCE AGGREGATE:")
        print(f"  • Mean Stop-Scroll:  {self.aggregate_reaction.mean_stop_scroll:.1%}")
        print(f"  • Mean Watch:        {self.aggregate_reaction.mean_watch_probability:.1%}")
        print(f"  • Mean Shareability: {self.aggregate_reaction.mean_share_probability:.1%}")
        print(f"  • Dominant Emotions: {', '.join(f'{k} ({v})' for k, v in self.aggregate_reaction.dominant_emotions.items())}")

        if self.aggregate_reaction.consensus_weaknesses:
            print("\nKEY IDENTIFIED WEAKNESSES:")
            for w in self.aggregate_reaction.consensus_weaknesses[:3]:
                print(f"  - {w}")

        print("\n" + self.score_breakdown.render_ascii_bars())
        print("=" * 70)


class ViralityEngine:
    """
    Central coordinator of the Virality Lab framework.
    Manages the flow from Content ingestion through Audience Simulation, Aggregation, and Scoring.
    """

    def __init__(
        self,
        simulation_engine: SimulationEngine,
        aggregator: Optional[ReactionAggregator] = None,
        scoring_engine: Optional[Any] = None,
    ) -> None:
        if not isinstance(simulation_engine, SimulationEngine):
            raise TypeError(f"Expected SimulationEngine, got {type(simulation_engine).__name__}")

        self.simulation_engine = simulation_engine
        self.aggregator = aggregator or ReactionAggregator()
        
        # Support either legacy ScoringEngine or new ViralityScoringEngine / BaseScoringEngine
        self.scoring_engine = scoring_engine or ViralityScoringEngine()
        self._legacy_scoring_engine = ScoringEngine()

        # Extension point hooks for future modules
        self._content_analyzer: Optional[Any] = None
        self._optimizer: Optional[Callable[[ViralityEngineResult], List[Content]]] = None

    def register_content_analyzer(self, analyzer: Any) -> None:
        """Register a Content Analyzer (e.g. LocalContentAnalyzer, MockContentAnalyzer, or custom callable)."""
        self._content_analyzer = analyzer

    def register_optimizer(self, optimizer_fn: Callable[[ViralityEngineResult], List[Content]]) -> None:
        """Register a future Optimizer Agent hook (e.g. variant generator)."""
        self._optimizer = optimizer_fn

    def run(self, content: Content) -> ViralityEngineResult:
        """
        Execute an end-to-end evaluation pipeline on a content item.
        """
        # Step 1: Optional Content Analyzer Enrichment
        processed_content = content
        profile = getattr(content, "profile", None)
        if self._content_analyzer is not None:
            if hasattr(self._content_analyzer, "analyze"):
                profile = self._content_analyzer.analyze(content)
                processed_content = content.model_copy(update={"profile": profile})
            elif callable(self._content_analyzer):
                res = self._content_analyzer(content)
                if isinstance(res, Content):
                    processed_content = res
                    profile = getattr(res, "profile", None)
                else:
                    processed_content = content.model_copy(update={"profile": res})
                    profile = res

        # Step 2 & 3: Audience Simulation
        simulation_result = self.simulation_engine.run(processed_content)

        # Step 4: Aggregation
        aggregate_reaction = self.aggregator.aggregate(simulation_result)

        # Step 5: Scoring (handles both new ViralityScoringEngine and legacy ScoringEngine)
        virality_score: Optional[ViralityScore] = None
        if isinstance(self.scoring_engine, (ViralityScoringEngine, BaseScoringEngine)):
            virality_score = self.scoring_engine.score(
                simulation_result=simulation_result,
                content_profile=profile,
                platform=content.platform,
            )
            # Create matching legacy breakdown for backward compatibility
            score_breakdown = ViralityScoreBreakdown(
                overall_score=virality_score.overall_score,
                stop_scroll_score=round(virality_score.raw_metrics.get("stop_scroll", None).mean * 100, 1) if "stop_scroll" in virality_score.raw_metrics else virality_score.components.retention,
                retention_score=virality_score.components.retention,
                shareability_score=virality_score.components.sharing,
                discussion_score=virality_score.components.engagement,
            )
        else:
            score_breakdown = self.scoring_engine.calculate(aggregate_reaction)

        return ViralityEngineResult(
            content=processed_content,
            simulation_result=simulation_result,
            aggregate_reaction=aggregate_reaction,
            score_breakdown=score_breakdown,
            virality_score=virality_score,
        )
