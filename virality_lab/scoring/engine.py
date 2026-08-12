"""
Virality Scoring & Audience Intelligence Engine.
Deterministically converts multi-agent behavioral observations into normalized 0-100
Virality Potential Scores, persona segment breakdowns, agreement indices, and actionable diagnostics.
"""

import statistics
from typing import Any, Dict, List, Optional

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Platform
from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.aggregator import AudienceAggregator
from virality_lab.scoring.calibration import BaseScoringEngine
from virality_lab.scoring.config import ScoringConfig
from virality_lab.scoring.explanation import ExplanationEngine
from virality_lab.scoring.schemas import (
    AudienceSummary,
    ComponentScores,
    MetricDistribution,
    PersonaScore,
    ScoreConfidence,
    ScoreDiagnostics,
    ScoreExplanation,
    ViralityScore,
)


class ViralityScoringEngine(BaseScoringEngine):
    """
    Core deterministic scoring engine for Virality Lab.
    Calculates 0–100 Virality Potential Scores based strictly on simulated audience behavior.
    """

    def __init__(
        self,
        config: Optional[ScoringConfig] = None,
        aggregator: Optional[AudienceAggregator] = None,
        explanation_engine: Optional[ExplanationEngine] = None,
    ) -> None:
        self.config = config or ScoringConfig.from_yaml()
        self.aggregator = aggregator or AudienceAggregator()
        self.explanation_engine = explanation_engine or ExplanationEngine()

    def calculate_persona_components(self, reaction: Reaction) -> ComponentScores:
        """
        Calculate normalized 0–100 component scores for an individual persona reaction.
        """
        mw = self.config.metric_weights

        ret_val = (
            reaction.stop_scroll * mw.retention.get("stop_scroll", 0.30)
            + reaction.watch_probability * mw.retention.get("watch", 0.30)
            + reaction.completion_probability * mw.retention.get("completion", 0.40)
        ) * self.config.scale_max

        share_val = (
            reaction.share_probability * mw.sharing.get("share", 1.00)
        ) * self.config.scale_max

        eng_val = (
            reaction.like_probability * mw.engagement.get("like", 0.25)
            + reaction.comment_probability * mw.engagement.get("comment", 0.30)
            + reaction.save_probability * mw.engagement.get("save", 0.45)
        ) * self.config.scale_max

        conv_val = (
            reaction.follow_probability * mw.conversion.get("follow", 1.00)
        ) * self.config.scale_max

        return ComponentScores(
            retention=round(max(0.0, min(self.config.scale_max, ret_val)), self.config.decimals),
            sharing=round(max(0.0, min(self.config.scale_max, share_val)), self.config.decimals),
            engagement=round(max(0.0, min(self.config.scale_max, eng_val)), self.config.decimals),
            conversion=round(max(0.0, min(self.config.scale_max, conv_val)), self.config.decimals),
        )

    def calculate_persona_score(
        self,
        reaction: Reaction,
        platform_weights: Dict[str, float],
    ) -> PersonaScore:
        """
        Calculate total persona score from individual components.
        """
        comps = self.calculate_persona_components(reaction)
        overall = (
            comps.retention * platform_weights["retention"]
            + comps.sharing * platform_weights["sharing"]
            + comps.engagement * platform_weights["engagement"]
            + comps.conversion * platform_weights["conversion"]
        )
        overall_clamped = round(max(0.0, min(self.config.scale_max, overall)), self.config.decimals)

        return PersonaScore(
            persona_name=reaction.persona_name,
            overall_score=overall_clamped,
            components=comps,
            dominant_emotion=reaction.emotional_response,
            reasoning=reaction.reasoning,
            strengths=reaction.strengths,
            weaknesses=reaction.weaknesses,
        )

    def score(
        self,
        simulation_result: SimulationResult,
        content_profile: Optional[ContentProfile] = None,
        profile: Optional[ContentProfile] = None,
        context: Optional[Any] = None,
        target_audience: Optional[str] = None,
        platform: Optional[Any] = None,
    ) -> ViralityScore:
        """
        Transform a SimulationResult into an interpretable, validated ViralityScore.
        
        Args:
            simulation_result: Simulation result with agent reactions.
            content_profile: Optional ContentProfile for context/diagnostics.
            profile: Alias for content_profile.
            context: Optional execution or campaign context.
            target_audience: Optional audience target string.
            platform: Optional platform (Platform enum or string) for platform weighting.
            
        Returns:
            Validated ViralityScore object with complete breakdown.
        """
        if content_profile is None and profile is not None:
            content_profile = profile
        if not isinstance(simulation_result, SimulationResult):
            raise TypeError(f"Expected SimulationResult, got {type(simulation_result).__name__}")

        reactions: List[Reaction] = simulation_result.reactions
        confidence = self.aggregator.calculate_confidence(simulation_result)

        # Handle zero valid reactions
        if not reactions:
            zero_comps = ComponentScores(retention=0.0, sharing=0.0, engagement=0.0, conversion=0.0)
            agreement = self.aggregator.calculate_agreement([])
            summary = AudienceSummary(
                mean_score=0.0,
                median_score=0.0,
                min_score=0.0,
                max_score=0.0,
                std_dev=0.0,
                agreement=agreement,
                strongest_persona="None",
                weakest_persona="None",
                persona_scores={},
            )
            diag = ScoreDiagnostics(
                strongest_dimension="none",
                weakest_dimension="none",
                strongest_persona="None",
                weakest_persona="None",
            )
            expl = ScoreExplanation(
                positive_drivers=[],
                negative_drivers=["No successful reactions available."],
                audience_verdict="Simulation failed or returned zero reactions.",
            )
            return ViralityScore(
                overall_score=0.0,
                components=zero_comps,
                audience=summary,
                diagnostics=diag,
                explanation=expl,
                confidence=confidence,
            )

        # 1. Resolve Platform Component Weights
        active_platform = platform
        if active_platform is None and content_profile is not None:
            active_platform = getattr(content_profile, "platform", None)

        component_weights = self.config.get_component_weights(active_platform)

        # 2. Compute Metric Distributions across all agents
        distributions = self.aggregator.aggregate_distributions(reactions)

        # 3. Calculate Global Component Scores from Aggregate Means
        mw = self.config.metric_weights
        global_retention = (
            distributions["stop_scroll"].mean * mw.retention.get("stop_scroll", 0.30)
            + distributions["watch_probability"].mean * mw.retention.get("watch", 0.30)
            + distributions["completion_probability"].mean * mw.retention.get("completion", 0.40)
        ) * self.config.scale_max

        global_sharing = (
            distributions["share_probability"].mean * mw.sharing.get("share", 1.00)
        ) * self.config.scale_max

        global_engagement = (
            distributions["like_probability"].mean * mw.engagement.get("like", 0.25)
            + distributions["comment_probability"].mean * mw.engagement.get("comment", 0.30)
            + distributions["save_probability"].mean * mw.engagement.get("save", 0.45)
        ) * self.config.scale_max

        global_conversion = (
            distributions["follow_probability"].mean * mw.conversion.get("follow", 1.00)
        ) * self.config.scale_max

        components = ComponentScores(
            retention=round(max(0.0, min(self.config.scale_max, global_retention)), self.config.decimals),
            sharing=round(max(0.0, min(self.config.scale_max, global_sharing)), self.config.decimals),
            engagement=round(max(0.0, min(self.config.scale_max, global_engagement)), self.config.decimals),
            conversion=round(max(0.0, min(self.config.scale_max, global_conversion)), self.config.decimals),
        )

        # 4. Compute Per-Persona Scores
        persona_scores_dict: Dict[str, PersonaScore] = {}
        for r in reactions:
            pscore = self.calculate_persona_score(r, component_weights)
            persona_scores_dict[r.persona_name] = pscore

        persona_scores_list = [p.overall_score for p in persona_scores_dict.values()]
        persona_names = list(persona_scores_dict.keys())

        # 5. Compute Weighted Overall Virality Potential Score
        # If custom persona weighting is provided, calculate weighted persona average;
        # otherwise use the weighted component formula (which mathematically equals unweighted persona average)
        persona_weights = self.config.get_persona_weights(persona_names)
        if self.config.persona_weights:
            overall_score = sum(persona_scores_dict[p].overall_score * persona_weights[p] for p in persona_names)
        else:
            overall_score = (
                components.retention * component_weights["retention"]
                + components.sharing * component_weights["sharing"]
                + components.engagement * component_weights["engagement"]
                + components.conversion * component_weights["conversion"]
            )

        overall_score = round(max(0.0, min(self.config.scale_max, overall_score)), self.config.decimals)

        # 6. Audience Agreement & Polarization
        agreement = self.aggregator.calculate_agreement(persona_scores_list, distributions)

        # 7. Extract Consensus Strengths & Weaknesses
        strengths, weaknesses = self.aggregator.extract_consensus_insights(reactions)

        # 8. Diagnostics & Explanations
        diagnostics = self.explanation_engine.generate_diagnostics(
            components=components,
            persona_scores=persona_scores_dict,
            strengths=strengths,
            weaknesses=weaknesses,
        )

        explanation = self.explanation_engine.generate_explanation(
            overall_score=overall_score,
            components=components,
            raw_metrics=distributions,
            persona_scores=persona_scores_dict,
        )

        # 9. Audience Summary
        summary = AudienceSummary(
            mean_score=round(statistics.mean(persona_scores_list), self.config.decimals),
            median_score=round(statistics.median(persona_scores_list), self.config.decimals),
            min_score=round(min(persona_scores_list), self.config.decimals),
            max_score=round(max(persona_scores_list), self.config.decimals),
            std_dev=round(statistics.stdev(persona_scores_list) if len(persona_scores_list) > 1 else 0.0, self.config.decimals),
            agreement=agreement,
            strongest_persona=diagnostics.strongest_persona,
            weakest_persona=diagnostics.weakest_persona,
            persona_scores=persona_scores_dict,
        )

        return ViralityScore(
            overall_score=overall_score,
            components=components,
            audience=summary,
            diagnostics=diagnostics,
            explanation=explanation,
            confidence=confidence,
            raw_metrics=distributions,
        )
