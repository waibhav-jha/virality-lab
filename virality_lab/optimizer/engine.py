"""
Optimization Engine.
Coordinates the iterative optimization loop:
Diagnose -> Generate Targeted Variants -> Simulate Variants -> Score Variants -> Compare -> Select Winner.
"""

from typing import List, Optional

from virality_lab.analyzer.base import ContentAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content
from virality_lab.core.simulation import SimulationEngine, SimulationResult
from virality_lab.optimizer.config import OptimizationConfig
from virality_lab.optimizer.diagnostics_mapper import DiagnosticsMapper
from virality_lab.optimizer.evaluator import VariantEvaluator
from virality_lab.optimizer.generator import BaseContentOptimizer, MockContentOptimizer
from virality_lab.optimizer.schemas import (
    EvaluatedVariant,
    OptimizationIteration,
    OptimizationObjective,
    OptimizationResult,
)
from virality_lab.optimizer.selector import VariantSelector
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.schemas import ViralityScore


class OptimizationEngine:
    """
    High-level engine coordinating iterative content refinement and variant simulation.
    """

    def __init__(
        self,
        simulation_engine: SimulationEngine,
        scoring_engine: Optional[ViralityScoringEngine] = None,
        analyzer: Optional[ContentAnalyzer] = None,
        generator: Optional[BaseContentOptimizer] = None,
        config: Optional[OptimizationConfig] = None,
    ) -> None:
        self.simulation_engine = simulation_engine
        self.scoring_engine = scoring_engine or ViralityScoringEngine()
        self.analyzer = analyzer or LocalContentAnalyzer()
        self.config = config or OptimizationConfig.from_yaml()
        self.generator = generator or MockContentOptimizer()

        self.mapper = DiagnosticsMapper()
        self.evaluator = VariantEvaluator(
            simulation_engine=self.simulation_engine,
            scoring_engine=self.scoring_engine,
            analyzer=self.analyzer,
            guardrail_config=self.config.guardrails,
        )
        self.selector = VariantSelector(minimum_improvement=self.config.minimum_improvement)

    def optimize(
        self,
        content: Content,
        profile: Optional[ContentProfile] = None,
        simulation: Optional[SimulationResult] = None,
        score: Optional[ViralityScore] = None,
        objective: Optional[OptimizationObjective] = None,
        max_iterations: Optional[int] = None,
    ) -> OptimizationResult:
        """
        Execute the content optimization loop.

        Args:
            content: Original content asset.
            profile: Optional pre-computed ContentProfile.
            simulation: Optional pre-computed baseline SimulationResult.
            score: Optional pre-computed baseline ViralityScore.
            objective: Creator optimization goal (defaults to config.default_objective).
            max_iterations: Max refinement iterations (defaults to config.max_iterations).

        Returns:
            OptimizationResult containing full audit history and the best performing content.
        """
        active_objective = objective or self.config.default_objective
        iterations_limit = max_iterations if max_iterations is not None else self.config.max_iterations

        # 1. Establish Baseline Evaluation if missing
        if profile is None:
            profile = self.analyzer.analyze(content)

        if simulation is None:
            simulation = self.simulation_engine.simulate(content=content, profile=profile)

        if score is None:
            score = self.scoring_engine.score(
                simulation_result=simulation,
                profile=profile,
                platform=content.platform,
            )

        original_content = content
        original_score = score

        current_baseline_content = content
        current_baseline_profile = profile
        current_baseline_score = score

        history: List[OptimizationIteration] = []
        overall_best_variant: Optional[EvaluatedVariant] = None

        # 2. Iterative Optimization Loop
        for iter_idx in range(iterations_limit):
            # A. Map Diagnostics to Action Plans
            plans = self.mapper.map_diagnostics_to_plans(
                content=current_baseline_content,
                score=current_baseline_score,
                profile=current_baseline_profile,
                objective=active_objective,
            )

            # B. Generate Targeted Variants
            candidate_variants = self.generator.generate_variants(
                content=current_baseline_content,
                score=current_baseline_score,
                plans=plans,
                num_variants=self.config.variants_per_iteration,
                objective=active_objective,
                profile=current_baseline_profile,
            )

            if not candidate_variants:
                history.append(
                    OptimizationIteration(
                        iteration_index=iter_idx,
                        baseline_content=current_baseline_content,
                        baseline_score=current_baseline_score,
                        evaluated_variants=[],
                        winning_variant=None,
                        stopped_reason="No variants were generated by the optimizer.",
                    )
                )
                break

            # C. Evaluate All Variants through the full simulation & scoring pipeline
            evaluated_variants: List[EvaluatedVariant] = []
            for var in candidate_variants:
                evaluated = self.evaluator.evaluate_variant(
                    variant=var,
                    baseline_score=current_baseline_score,
                )
                evaluated_variants.append(evaluated)

            # D. Select Winning Candidate
            winning_candidate = self.selector.select_winner(
                evaluated_variants=evaluated_variants,
                objective=active_objective,
            )

            # E. Record Iteration
            if winning_candidate is not None:
                history.append(
                    OptimizationIteration(
                        iteration_index=iter_idx,
                        baseline_content=current_baseline_content,
                        baseline_score=current_baseline_score,
                        evaluated_variants=evaluated_variants,
                        winning_variant=winning_candidate,
                        stopped_reason="Found winning variant meeting improvement threshold.",
                    )
                )
                current_baseline_content = winning_candidate.variant.content
                current_baseline_profile = winning_candidate.profile
                current_baseline_score = winning_candidate.score
                overall_best_variant = winning_candidate
            else:
                history.append(
                    OptimizationIteration(
                        iteration_index=iter_idx,
                        baseline_content=current_baseline_content,
                        baseline_score=current_baseline_score,
                        evaluated_variants=evaluated_variants,
                        winning_variant=None,
                        stopped_reason="No candidate achieved minimum improvement threshold or passed guardrails.",
                    )
                )
                # Halt iteration since no improvement was found
                break

        # 3. Formulate OptimizationResult
        final_content = overall_best_variant.variant.content if overall_best_variant else original_content
        final_score = overall_best_variant.score if overall_best_variant else original_score
        improvement = round(final_score.overall_score - original_score.overall_score, 2)

        summary_lines = [
            f"Optimization concluded after {len(history)} iteration(s).",
            f"Baseline score: {original_score.overall_score:.1f}/100.",
            f"Final score: {final_score.overall_score:.1f}/100 ({'+' if improvement >= 0 else ''}{improvement:.1f} pts).",
        ]
        if overall_best_variant:
            summary_lines.append(
                f"Selected variant '{overall_best_variant.variant.variant_id}' ({overall_best_variant.variant.optimization_target.value})."
            )
        else:
            summary_lines.append("Original content preserved as no variant improved simulated score.")

        return OptimizationResult(
            original_content=original_content,
            original_score=original_score,
            history=history,
            best_variant=overall_best_variant,
            best_content=final_content,
            best_score=final_score,
            overall_improvement=improvement,
            summary=" ".join(summary_lines),
        )
