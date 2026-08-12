"""
Winner Selection & Tie-Breaking Engine.
Selects the winning evaluated variant based on creator objective, guardrails,
minimum improvement threshold, and deterministic tie-breaking.
"""

from typing import List, Optional

from virality_lab.optimizer.schemas import EvaluatedVariant, OptimizationObjective


class VariantSelector:
    """
    Deterministic selector choosing the best content variant.
    No LLM inference or subjective decisions are used during selection.
    """

    def __init__(self, minimum_improvement: float = 2.0) -> None:
        self.minimum_improvement = minimum_improvement

    def select_winner(
        self,
        evaluated_variants: List[EvaluatedVariant],
        objective: OptimizationObjective = OptimizationObjective.OVERALL,
    ) -> Optional[EvaluatedVariant]:
        """
        Choose the best candidate among evaluated variants meeting guardrails and threshold.
        """
        # Filter out variants that failed regression guardrails
        valid_candidates = [ev for ev in evaluated_variants if ev.guardrail_passed]
        if not valid_candidates:
            return None

        # Filter by minimum improvement threshold on target objective or overall
        improving_candidates: List[EvaluatedVariant] = []
        for ev in valid_candidates:
            obj_score_delta = self._get_objective_delta(ev, objective)
            overall_delta = ev.comparison.absolute_change
            if obj_score_delta >= self.minimum_improvement or overall_delta >= self.minimum_improvement:
                improving_candidates.append(ev)

        if not improving_candidates:
            return None

        # Sort with deterministic multi-key ranking
        def sort_key(ev: EvaluatedVariant):
            obj_val = self._get_objective_value(ev, objective)
            overall_val = ev.score.overall_score
            agreement_val = ev.score.audience.agreement.agreement_score
            # Fewer changes prefer minimal targeted edits
            changes_penalty = -len(ev.variant.changes)
            return (obj_val, overall_val, agreement_val, changes_penalty)

        improving_candidates.sort(key=sort_key, reverse=True)
        return improving_candidates[0]

    def _get_objective_value(self, ev: EvaluatedVariant, objective: OptimizationObjective) -> float:
        """Extract the numeric score for the target objective."""
        comps = ev.score.components
        if objective in (OptimizationObjective.SHARES, OptimizationObjective.REACH):
            return comps.sharing
        elif objective == OptimizationObjective.RETENTION:
            return comps.retention
        elif objective in (OptimizationObjective.COMMENTS, OptimizationObjective.SAVES):
            return comps.engagement
        elif objective == OptimizationObjective.FOLLOWERS:
            return comps.conversion
        return ev.score.overall_score

    def _get_objective_delta(self, ev: EvaluatedVariant, objective: OptimizationObjective) -> float:
        """Extract the delta for the target objective."""
        changes = ev.comparison.component_changes
        if objective in (OptimizationObjective.SHARES, OptimizationObjective.REACH):
            return changes.get("sharing", 0.0)
        elif objective == OptimizationObjective.RETENTION:
            return changes.get("retention", 0.0)
        elif objective in (OptimizationObjective.COMMENTS, OptimizationObjective.SAVES):
            return changes.get("engagement", 0.0)
        elif objective == OptimizationObjective.FOLLOWERS:
            return changes.get("conversion", 0.0)
        return ev.comparison.absolute_change
