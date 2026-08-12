"""
Deterministic explanation and diagnostic generator for Virality Lab.
Synthesizes transparent causal explanations and action-oriented friction audits
directly from metric thresholds and persona outputs without LLM hallucination.
"""

from typing import Dict, List, Tuple
from virality_lab.scoring.schemas import (
    ComponentScores,
    MetricDistribution,
    PersonaScore,
    ScoreDiagnostics,
    ScoreExplanation,
)


class ExplanationEngine:
    """
    Generates deterministic, rule-based explanations and diagnostic audits from scoring data.
    """

    def generate_diagnostics(
        self,
        components: ComponentScores,
        persona_scores: Dict[str, PersonaScore],
        strengths: List[str],
        weaknesses: List[str],
    ) -> ScoreDiagnostics:
        """
        Identify strongest and weakest dimensions and audience segments.
        """
        comp_dict = {
            "retention": components.retention,
            "sharing": components.sharing,
            "engagement": components.engagement,
            "conversion": components.conversion,
        }
        strongest_dim = max(comp_dict.items(), key=lambda x: x[1])[0]
        weakest_dim = min(comp_dict.items(), key=lambda x: x[1])[0]

        if persona_scores:
            strongest_persona = max(persona_scores.items(), key=lambda x: x[1].overall_score)[0]
            weakest_persona = min(persona_scores.items(), key=lambda x: x[1].overall_score)[0]
        else:
            strongest_persona = "N/A"
            weakest_persona = "N/A"

        return ScoreDiagnostics(
            strongest_dimension=strongest_dim,
            weakest_dimension=weakest_dim,
            strongest_persona=strongest_persona,
            weakest_persona=weakest_persona,
            consensus_strengths=strengths[:5],
            consensus_weaknesses=weaknesses[:5],
        )

    def generate_explanation(
        self,
        overall_score: float,
        components: ComponentScores,
        raw_metrics: Dict[str, MetricDistribution],
        persona_scores: Dict[str, PersonaScore],
    ) -> ScoreExplanation:
        """
        Generate positive and negative drivers using deterministic metric evaluation rules.
        """
        positive_drivers: List[str] = []
        negative_drivers: List[str] = []

        # Hook / Stop-scroll evaluation
        if "stop_scroll" in raw_metrics:
            ss_mean = raw_metrics["stop_scroll"].mean
            if ss_mean >= 0.75:
                positive_drivers.append(f"Strong opening hook stopping power ({ss_mean * 100:.0f}% stop-scroll rate) captures immediate attention.")
            elif ss_mean < 0.50:
                negative_drivers.append(f"Weak initial hook ({ss_mean * 100:.0f}% stop-scroll rate) leads to high immediate feed drop-off.")

        # Watch / Completion evaluation
        if "completion_probability" in raw_metrics:
            comp_mean = raw_metrics["completion_probability"].mean
            if comp_mean >= 0.70:
                positive_drivers.append(f"High watch-through completion ({comp_mean * 100:.0f}%) indicates strong narrative pacing and payoff.")
            elif comp_mean < 0.45:
                negative_drivers.append(f"Significant mid-video drop-off ({comp_mean * 100:.0f}% completion rate) suggests delayed or weak payoff.")

        # Shareability evaluation
        if "share_probability" in raw_metrics:
            sh_mean = raw_metrics["share_probability"].mean
            if sh_mean >= 0.60:
                positive_drivers.append(f"High organic shareability ({sh_mean * 100:.0f}%) drives direct peer-to-peer amplification.")
            elif sh_mean < 0.35:
                negative_drivers.append(f"Low forwarding probability ({sh_mean * 100:.0f}%) limits organic viral distribution.")

        # Save / Utility evaluation
        if "save_probability" in raw_metrics:
            sv_mean = raw_metrics["save_probability"].mean
            if sv_mean >= 0.65:
                positive_drivers.append(f"Strong reference utility ({sv_mean * 100:.0f}% bookmark rate) provides algorithmic boost via saves.")

        # Follow / Conversion evaluation
        if "follow_probability" in raw_metrics:
            fl_mean = raw_metrics["follow_probability"].mean
            if fl_mean < 0.30:
                negative_drivers.append(f"Low creator follow intent ({fl_mean * 100:.0f}%) limits permanent audience growth.")

        # Persona-specific insights
        if persona_scores:
            best_name, best_p = max(persona_scores.items(), key=lambda x: x[1].overall_score)
            worst_name, worst_p = min(persona_scores.items(), key=lambda x: x[1].overall_score)

            if best_p.overall_score >= 80.0:
                positive_drivers.append(f"Resonates exceptionally well with '{best_name}' segment ({best_p.overall_score:.0f}/100).")
            if worst_p.overall_score <= 50.0:
                friction_snippet = f": {worst_p.weaknesses[0]}" if worst_p.weaknesses else ""
                negative_drivers.append(f"High resistance from '{worst_name}' segment ({worst_p.overall_score:.0f}/100){friction_snippet}.")

        # Audience verdict synthesis
        if overall_score >= 80.0:
            verdict = "High virality potential driven by strong initial retention and broad audience resonance."
        elif overall_score >= 65.0:
            verdict = "Solid virality potential with clear strengths in specific audience segments, but targeted optimization needed on friction points."
        elif overall_score >= 50.0:
            verdict = "Moderate performance with audience division; requires hook strengthening and clearer value proposition."
        else:
            verdict = "Low virality potential due to widespread audience friction and rapid drop-off."

        return ScoreExplanation(
            positive_drivers=positive_drivers,
            negative_drivers=negative_drivers,
            audience_verdict=verdict,
        )
