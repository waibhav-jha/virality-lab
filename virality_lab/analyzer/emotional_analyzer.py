"""
Emotional Profile Analyzer extracting tonal signals, valence, and emotional intensities from content.
"""

from virality_lab.analyzer.schemas import EmotionalProfile, HookAnalysis, TextAnalysis


class EmotionalAnalyzer:
    """
    Evaluates emotional tone and intensity based on text, hook, and stylistic cues.
    """

    def analyze(
        self,
        text_analysis: TextAnalysis,
        hook_analysis: HookAnalysis,
    ) -> EmotionalProfile:
        """
        Synthesize emotional indicators into an EmotionalProfile model.
        """
        humor = text_analysis.is_humorous
        curiosity = hook_analysis.curiosity
        surprise = min(1.0, (hook_analysis.novelty * 0.6) + (text_analysis.exclamation_count * 0.15))
        intensity = hook_analysis.emotional_intensity

        # Valence estimate
        pos = min(1.0, 0.4 + (humor * 0.4) + (text_analysis.is_educational * 0.2))
        neg = min(1.0, text_analysis.is_controversial * 0.5)

        # Dominant emotion selection
        emotions = {
            "curious": curiosity,
            "entertained": humor,
            "surprised": surprise,
            "inspired": text_analysis.is_educational,
            "provoked": text_analysis.is_controversial,
        }
        dominant = max(emotions.items(), key=lambda x: x[1])[0]

        return EmotionalProfile(
            dominant_emotion=dominant,
            emotional_intensity=round(intensity, 2),
            positive_score=round(pos, 2),
            negative_score=round(neg, 2),
            surprise=round(surprise, 2),
            humor=round(humor, 2),
            curiosity=round(curiosity, 2),
            fear=0.05,
            anger=round(neg * 0.5, 2),
            joy=round(humor * 0.8, 2),
            sadness=0.05,
        )
