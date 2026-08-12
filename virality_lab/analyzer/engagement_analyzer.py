"""
Engagement Signals Analyzer extracting Layer 2 intrinsic content properties:
Curiosity, relatability, novelty, controversy, usefulness, and behavioral affordances.
"""

from typing import Optional
from virality_lab.analyzer.schemas import (
    EngagementFeatures,
    HookAnalysis,
    TextAnalysis,
    VisualAnalysis,
)


class EngagementAnalyzer:
    """
    Computes intrinsic content engagement signals (Layer 2).
    Distinct from Layer 3 persona behavioral reactions.
    """

    def analyze(
        self,
        text_analysis: TextAnalysis,
        hook_analysis: HookAnalysis,
        visual_analysis: Optional[VisualAnalysis] = None,
    ) -> EngagementFeatures:
        """
        Derive content engagement signals from text, hook, and visual features.
        """
        # Curiosity signal from hook and questions
        curiosity = max(hook_analysis.curiosity, min(1.0, 0.4 + (text_analysis.question_count * 0.2)))

        # Relatability signal from personal/storytelling cues
        relatability = min(1.0, (text_analysis.is_personal * 0.5) + (text_analysis.is_humorous * 0.4) + 0.3)

        # Novelty signal
        novelty = hook_analysis.novelty

        # Controversy signal
        controversy = text_analysis.is_controversial

        # Practical usefulness signal from educational indicators & specificity
        usefulness = min(1.0, (text_analysis.is_educational * 0.5) + (hook_analysis.specificity * 0.4) + 0.2)

        # Emotional intensity
        emotional_intensity = hook_analysis.emotional_intensity

        # Behavioral affordance signals (intrinsic content drivers)
        # Content with high novelty + humor + relatability has a strong intrinsic shareability signal
        shareability = min(1.0, (relatability * 0.4) + (novelty * 0.3) + (text_analysis.is_humorous * 0.3))

        # Content with questions or controversy has a strong intrinsic commentability signal
        commentability = min(1.0, (controversy * 0.5) + (text_analysis.is_question_based * 0.4) + 0.2)

        # Content with high educational utility and specific tools has a strong saveability signal
        saveability = min(1.0, (usefulness * 0.6) + (hook_analysis.specificity * 0.3) + (0.2 if text_analysis.cta_type == "save" else 0.0))

        return EngagementFeatures(
            curiosity_signal=round(curiosity, 2),
            relatability_signal=round(relatability, 2),
            novelty_signal=round(novelty, 2),
            controversy_signal=round(controversy, 2),
            usefulness_signal=round(usefulness, 2),
            emotional_intensity_signal=round(emotional_intensity, 2),
            shareability_signal=round(shareability, 2),
            commentability_signal=round(commentability, 2),
            saveability_signal=round(saveability, 2),
        )
