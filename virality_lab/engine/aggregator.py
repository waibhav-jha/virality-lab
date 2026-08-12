"""
Reaction Aggregator for computing statistical summaries across persona reactions.
Converts multi-agent behavioral outputs into coherent audience-level metrics.
"""

from collections import Counter
from typing import Any, Dict, List
from pydantic import BaseModel, Field

from virality_lab.core.reaction import Reaction
from virality_lab.core.simulation import SimulationResult


class AggregateReaction(BaseModel):
    """
    Statistical aggregation of individual persona reactions.
    Preserves distribution bounds (min/max) alongside mean behavioral probabilities.
    """

    content_id: str = Field(..., description="Evaluated content item identifier.")
    total_reactions: int = Field(..., ge=0, description="Total number of valid reactions aggregated.")

    # Averages
    mean_stop_scroll: float = Field(..., ge=0.0, le=1.0, description="Average probability of stopping scroll.")
    mean_watch_probability: float = Field(..., ge=0.0, le=1.0, description="Average probability of watching past hook.")
    mean_completion_probability: float = Field(..., ge=0.0, le=1.0, description="Average probability of full completion.")
    mean_like_probability: float = Field(..., ge=0.0, le=1.0, description="Average like probability.")
    mean_comment_probability: float = Field(..., ge=0.0, le=1.0, description="Average comment probability.")
    mean_share_probability: float = Field(..., ge=0.0, le=1.0, description="Average share probability.")
    mean_save_probability: float = Field(..., ge=0.0, le=1.0, description="Average save/bookmark probability.")
    mean_follow_probability: float = Field(..., ge=0.0, le=1.0, description="Average follow probability.")

    # Variance / Extremes
    min_stop_scroll: float = Field(..., ge=0.0, le=1.0)
    max_stop_scroll: float = Field(..., ge=0.0, le=1.0)
    min_share_probability: float = Field(..., ge=0.0, le=1.0)
    max_share_probability: float = Field(..., ge=0.0, le=1.0)

    # Qualitative consensus
    dominant_emotions: Dict[str, int] = Field(default_factory=dict, description="Frequency count of emotional reactions.")
    consensus_strengths: List[str] = Field(default_factory=list, description="Unique strengths noted by personas.")
    consensus_weaknesses: List[str] = Field(default_factory=list, description="Unique friction points/weaknesses noted.")
    individual_summaries: List[Dict[str, Any]] = Field(default_factory=list, description="Brief per-persona summaries.")


class ReactionAggregator:
    """
    Aggregates a collection of Reaction models into an AggregateReaction summary.
    """

    def aggregate(self, simulation_result: SimulationResult) -> AggregateReaction:
        """
        Aggregate individual agent reactions into statistical summaries.
        
        Args:
            simulation_result: The SimulationResult output by the SimulationEngine.
            
        Returns:
            AggregateReaction with calculated means, distributions, and consensus insights.
        """
        if not isinstance(simulation_result, SimulationResult):
            raise TypeError(f"Expected SimulationResult, got {type(simulation_result).__name__}")

        reactions: List[Reaction] = simulation_result.reactions

        if not reactions:
            raise ValueError(f"Cannot aggregate empty reaction list for content '{simulation_result.content_id}'.")

        n = len(reactions)

        # Compute means
        mean_stop_scroll = sum(r.stop_scroll for r in reactions) / n
        mean_watch = sum(r.watch_probability for r in reactions) / n
        mean_completion = sum(r.completion_probability for r in reactions) / n
        mean_like = sum(r.like_probability for r in reactions) / n
        mean_comment = sum(r.comment_probability for r in reactions) / n
        mean_share = sum(r.share_probability for r in reactions) / n
        mean_save = sum(r.save_probability for r in reactions) / n
        mean_follow = sum(r.follow_probability for r in reactions) / n

        # Extremes
        stop_scrolls = [r.stop_scroll for r in reactions]
        shares = [r.share_probability for r in reactions]

        # Emotion counts
        emotion_counter = Counter(r.emotional_response.lower() for r in reactions)

        # Collect unique strengths and weaknesses preserving order
        strengths: List[str] = []
        for r in reactions:
            for s in r.strengths:
                if s not in strengths:
                    strengths.append(s)

        weaknesses: List[str] = []
        for r in reactions:
            for w in r.weaknesses:
                if w not in weaknesses:
                    weaknesses.append(w)

        # Per persona summary records
        individual_summaries = [
            {
                "persona": r.persona_name,
                "stop_scroll": r.stop_scroll,
                "share": r.share_probability,
                "watch": r.watch_probability,
                "emotion": r.emotional_response,
                "top_weakness": r.weaknesses[0] if r.weaknesses else None,
            }
            for r in reactions
        ]

        return AggregateReaction(
            content_id=simulation_result.content_id,
            total_reactions=n,
            mean_stop_scroll=round(mean_stop_scroll, 3),
            mean_watch_probability=round(mean_watch, 3),
            mean_completion_probability=round(mean_completion, 3),
            mean_like_probability=round(mean_like, 3),
            mean_comment_probability=round(mean_comment, 3),
            mean_share_probability=round(mean_share, 3),
            mean_save_probability=round(mean_save, 3),
            mean_follow_probability=round(mean_follow, 3),
            min_stop_scroll=round(min(stop_scrolls), 3),
            max_stop_scroll=round(max(stop_scrolls), 3),
            min_share_probability=round(min(shares), 3),
            max_share_probability=round(max(shares), 3),
            dominant_emotions=dict(emotion_counter),
            consensus_strengths=strengths,
            consensus_weaknesses=weaknesses,
            individual_summaries=individual_summaries,
        )
