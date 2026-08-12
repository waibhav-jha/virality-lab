"""
Audience Aggregator for statistical metric distribution, audience agreement,
polarization analysis, and simulation coverage tracking.
"""

from collections import Counter
import math
import statistics
from typing import Any, Dict, List, Optional, Tuple

from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.schemas import (
    AudienceAgreement,
    MetricDistribution,
    ScoreConfidence,
)


class AudienceAggregator:
    """
    Computes statistical metric distributions across multi-agent behavioral reactions.
    Quantifies audience agreement, polarization, and simulation coverage.
    """

    METRIC_NAMES = [
        "stop_scroll",
        "watch_probability",
        "completion_probability",
        "like_probability",
        "comment_probability",
        "share_probability",
        "save_probability",
        "follow_probability",
    ]

    def aggregate_distributions(self, reactions: List[Reaction]) -> Dict[str, MetricDistribution]:
        """
        Calculate statistical distribution (mean, median, std_dev, min, max) for each behavioral probability.
        """
        if not reactions:
            raise ValueError("Cannot aggregate empty list of reactions.")

        distributions: Dict[str, MetricDistribution] = {}

        for metric in self.METRIC_NAMES:
            values = [float(getattr(r, metric)) for r in reactions]
            n = len(values)
            mean_val = statistics.mean(values)
            med_val = statistics.median(values)
            std_val = statistics.stdev(values) if n > 1 else 0.0
            min_v = min(values)
            max_v = max(values)

            distributions[metric] = MetricDistribution(
                mean=round(mean_val, 4),
                median=round(med_val, 4),
                std_dev=round(std_val, 4),
                min_val=round(min_v, 4),
                max_val=round(max_v, 4),
            )

        return distributions

    def calculate_agreement(
        self,
        persona_scores: List[float],
        distributions: Optional[Dict[str, MetricDistribution]] = None,
    ) -> AudienceAgreement:
        """
        Derive Audience Agreement and Polarization from persona score dispersion.
        Agreement ranges from 0.0 (maximum division) to 1.0 (perfect consensus).
        """
        if not persona_scores or len(persona_scores) <= 1:
            return AudienceAgreement(
                agreement_score=1.0,
                polarization_score=0.0,
                level="high",
                interpretation="Unanimous evaluation (single or uniform agent response).",
            )

        std_dev = statistics.stdev(persona_scores)
        # Standard score range is 0-100; max expected standard deviation is ~35-40
        # Normalize spread: std_dev of 0 -> agreement 1.0; std_dev >= 30 -> agreement <= 0.25
        normalized_spread = min(1.0, std_dev / 35.0)
        agreement = round(max(0.0, 1.0 - normalized_spread), 3)
        polarization = round(1.0 - agreement, 3)

        if agreement >= 0.75:
            level = "high"
            interpretation = "High audience consensus: personas responded consistently across segments."
        elif agreement >= 0.50:
            level = "moderate"
            interpretation = "Moderate variance: normal divergence between distinct audience personas."
        else:
            level = "polarized"
            interpretation = "High polarization: sharp divergence where some personas resonated strongly while others experienced friction."

        return AudienceAgreement(
            agreement_score=agreement,
            polarization_score=polarization,
            level=level,
            interpretation=interpretation,
        )

    def calculate_confidence(self, simulation_result: SimulationResult) -> ScoreConfidence:
        """
        Assess simulation coverage and calculate uncertainty level.
        """
        total_expected = simulation_result.total_agents or len(simulation_result.reactions)
        evaluated = len(simulation_result.reactions)
        coverage = round(evaluated / max(1, total_expected), 3)

        notes: List[str] = []
        if evaluated == 0:
            return ScoreConfidence(
                simulation_coverage=0.0,
                evaluated_agents=0,
                expected_agents=total_expected,
                uncertainty_level="high",
                notes=["No successful agent reactions available for evaluation."],
            )

        if coverage < 1.0:
            notes.append(f"Incomplete simulation coverage: {total_expected - evaluated} agent(s) failed.")

        # Uncertainty based on coverage and sample count
        if coverage >= 1.0 and evaluated >= 4:
            uncertainty = "low"
        elif coverage >= 0.8 and evaluated >= 3:
            uncertainty = "moderate"
        else:
            uncertainty = "high"
            notes.append("High uncertainty due to limited agent sample or partial execution.")

        return ScoreConfidence(
            simulation_coverage=coverage,
            evaluated_agents=evaluated,
            expected_agents=total_expected,
            uncertainty_level=uncertainty,
            notes=notes,
        )

    def extract_consensus_insights(self, reactions: List[Reaction]) -> Tuple[List[str], List[str]]:
        """
        Extract unique strengths and friction points from persona reactions.
        """
        strengths: List[str] = []
        weaknesses: List[str] = []

        for r in reactions:
            for s in r.strengths:
                s_clean = s.strip()
                if s_clean and s_clean not in strengths:
                    strengths.append(s_clean)
            for w in r.weaknesses:
                w_clean = w.strip()
                if w_clean and w_clean not in weaknesses:
                    weaknesses.append(w_clean)

        return strengths, weaknesses
