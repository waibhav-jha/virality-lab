"""
Variant Evaluator.
Executes the identical evaluation pipeline (Analyzer -> Simulation -> Scoring)
on candidate variants and evaluates regression guardrails.
"""

from typing import Dict, List, Optional

from virality_lab.analyzer.base import ContentAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.core.simulation import SimulationEngine
from virality_lab.optimizer.config import GuardrailConfig
from virality_lab.optimizer.schemas import ContentVariant, EvaluatedVariant, OptimizationComparison
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.schemas import ViralityScore


class VariantEvaluator:
    """
    Evaluates ContentVariants through the standard Virality Lab simulation pipeline.
    Ensures exact evaluation parity between original content and all candidate variants.
    """

    def __init__(
        self,
        simulation_engine: SimulationEngine,
        scoring_engine: ViralityScoringEngine,
        analyzer: Optional[ContentAnalyzer] = None,
        guardrail_config: Optional[GuardrailConfig] = None,
    ) -> None:
        self.simulation_engine = simulation_engine
        self.scoring_engine = scoring_engine
        self.analyzer = analyzer or LocalContentAnalyzer()
        self.guardrails = guardrail_config or GuardrailConfig()

    def evaluate_variant(
        self,
        variant: ContentVariant,
        baseline_score: ViralityScore,
    ) -> EvaluatedVariant:
        """
        Run the candidate variant through the full analysis, simulation, and scoring pipeline.
        """
        # 1. Content Analysis
        profile = self.analyzer.analyze(variant.content)

        # 2. Audience Simulation
        sim_result = self.simulation_engine.simulate(
            content=variant.content,
            profile=profile,
        )

        # 3. Virality Scoring
        var_score = self.scoring_engine.score(
            simulation_result=sim_result,
            profile=profile,
            platform=variant.content.platform,
        )

        # 4. Compare with Baseline
        comparison = self._build_comparison(baseline_score, var_score)

        # 5. Check Guardrails
        guardrail_passed, rejections = self._check_guardrails(baseline_score, var_score, comparison)
        comparison.is_regression = not guardrail_passed
        comparison.regression_reasons = rejections

        return EvaluatedVariant(
            variant=variant,
            profile=profile,
            simulation_result=sim_result,
            score=var_score,
            comparison=comparison,
            guardrail_passed=guardrail_passed,
            guardrail_rejections=rejections,
        )

    def _build_comparison(
        self,
        baseline: ViralityScore,
        variant: ViralityScore,
    ) -> OptimizationComparison:
        """Compute delta changes between baseline and variant across all dimensions."""
        orig_s = baseline.overall_score
        var_s = variant.overall_score
        abs_change = round(var_s - orig_s, 2)
        rel_change = round((abs_change / orig_s) * 100, 2) if orig_s > 0 else 0.0

        # Component changes
        comp_changes = {
            "retention": round(variant.components.retention - baseline.components.retention, 2),
            "sharing": round(variant.components.sharing - baseline.components.sharing, 2),
            "engagement": round(variant.components.engagement - baseline.components.engagement, 2),
            "conversion": round(variant.components.conversion - baseline.components.conversion, 2),
        }

        # Audience persona changes
        aud_changes: Dict[str, float] = {}
        for p_name, var_p in variant.audience.persona_scores.items():
            orig_p = baseline.audience.persona_scores.get(p_name)
            if orig_p:
                aud_changes[p_name] = round(var_p.overall_score - orig_p.overall_score, 2)

        # Agreement change
        agreement_change = round(
            (variant.audience.agreement.agreement_score - baseline.audience.agreement.agreement_score) * 100,
            2,
        )

        return OptimizationComparison(
            original_score=orig_s,
            variant_score=var_s,
            absolute_change=abs_change,
            relative_change=rel_change,
            component_changes=comp_changes,
            audience_changes=aud_changes,
            agreement_change=agreement_change,
        )

    def _check_guardrails(
        self,
        baseline: ViralityScore,
        variant: ViralityScore,
        comparison: OptimizationComparison,
    ) -> tuple[bool, List[str]]:
        """Validate variant against configured regression guardrails."""
        rejections: List[str] = []

        # 1. Check Overall Drop
        if self.guardrails.require_positive_overall and comparison.absolute_change < 0:
            rejections.append(
                f"Overall virality potential decreased by {abs(comparison.absolute_change):.1f} points."
            )

        # 2. Check Retention Drop
        orig_ret = baseline.components.retention
        var_ret = variant.components.retention
        if orig_ret > 0:
            ret_drop_pct = ((orig_ret - var_ret) / orig_ret) * 100
            if ret_drop_pct > self.guardrails.max_retention_drop_pct:
                rejections.append(
                    f"Retention dropped by {ret_drop_pct:.1f}% (allowed: max {self.guardrails.max_retention_drop_pct}%)."
                )

        # 3. Check Component Points Drop
        for comp_name, change in comparison.component_changes.items():
            if change < -self.guardrails.max_component_drop_points:
                rejections.append(
                    f"Component '{comp_name}' dropped by {abs(change):.1f} points (allowed: max {self.guardrails.max_component_drop_points})."
                )

        passed = len(rejections) == 0
        return passed, rejections
