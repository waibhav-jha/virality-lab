"""
Deterministic Mock Content Analyzer for testing and demonstration workflows.
Produces complete, calibrated ContentProfile structures with mock audit provenance.
"""

from typing import Optional
from virality_lab.analyzer.base import ContentAnalyzer
from virality_lab.analyzer.schemas import (
    AnalysisCapability,
    AudioAnalysis,
    BasicMediaInfo,
    ContentProfile,
    ContentStructure,
    EmotionalProfile,
    EngagementFeatures,
    HookAnalysis,
    HookType,
    StructureSegment,
    TextAnalysis,
    TranscriptAnalysis,
    VisualAnalysis,
    VisualHookAnalysis,
)
from virality_lab.core.content import Content, MediaType


class MockContentAnalyzer(ContentAnalyzer):
    """
    Mock Content Analyzer generating rich, pre-calibrated ContentProfile objects.
    Useful for unit testing, offline demonstrations, and UI mocking.
    """

    def __init__(self, predefined_profile: Optional[ContentProfile] = None) -> None:
        self.predefined_profile = predefined_profile

    def analyze(self, content: Content) -> ContentProfile:
        """
        Produce a deterministic ContentProfile matching the provided content.
        """
        if not isinstance(content, Content):
            raise TypeError(f"Expected Content instance, got {type(content).__name__}")

        if self.predefined_profile is not None:
            return self.predefined_profile.model_copy(update={"content_id": content.id})

        caption = content.caption or "Check out this productivity hack!"
        transcript = content.transcript or "If you are wasting time studying manually, here are 3 AI tools to save 10 hours."
        duration = 18.4 if content.media_type == MediaType.SHORT_VIDEO else None

        media_info = BasicMediaInfo(
            platform=content.platform,
            media_type=content.media_type,
            duration_sec=duration,
            width=1080 if duration else None,
            height=1920 if duration else None,
            aspect_ratio=round(1080 / 1920, 4) if duration else None,
            language="en",
            fps=30.0 if duration else None,
            codec="h264" if duration else None,
        )

        text_analysis = TextAnalysis(
            char_count=len(caption),
            word_count=len(caption.split()),
            sentence_count=1,
            readability_score=78.5,
            question_count=caption.count("?"),
            exclamation_count=caption.count("!"),
            hashtags=["#ai", "#studyhacks", "#tech"],
            mentions=[],
            cta_present=True,
            cta_type="save",
            is_educational=0.85,
            is_informational=0.80,
            is_personal=0.75,
            is_humorous=0.60,
        )

        hook_analysis = HookAnalysis(
            hook_text="If you are wasting time studying manually, here are 3 AI tools to save 10 hours.",
            hook_type=HookType.VALUE_PROMISE,
            hook_duration_sec=3.0,
            hook_strength=0.84,
            curiosity=0.91,
            clarity=0.88,
            novelty=0.76,
            emotional_intensity=0.72,
            specificity=0.87,
        )

        visual_analysis = VisualAnalysis(
            faces_present=True,
            face_count=1,
            text_present=True,
            detected_objects=["person", "laptop", "screen_recording"],
            scene_changes=6,
            visual_complexity=0.68,
            motion_level=0.75,
            brightness=0.74,
            contrast=0.70,
            colorfulness=0.65,
            visual_novelty=0.78,
            thumbnail_quality=0.86,
            visual_hook=VisualHookAnalysis(
                first_frame_clarity=0.90,
                subject_visibility=0.88,
                visual_curiosity=0.85,
                text_overlay_present=True,
                composition_score=0.82,
                visual_clutter=0.25,
            ),
        )

        audio_analysis = AudioAnalysis(
            has_audio=True,
            duration_sec=duration,
            speech_present=True,
            music_present=True,
            silence_ratio=0.06,
            speech_rate_wpm=162.0,
            energy_level=0.82,
        )

        transcript_analysis = TranscriptAnalysis(
            transcript_text=transcript,
            word_count=len(transcript.split()),
            speaking_rate_wpm=162.0,
            sentence_count=2,
            question_count=0,
            repeated_phrases=["ai tools", "study hacks"],
            has_payoff=True,
            has_cta=True,
            key_topics=["ai", "productivity", "study", "tools"],
        )

        structure = ContentStructure(
            hook=StructureSegment(detected=True, start_sec=0.0, end_sec=3.0, confidence=0.95, summary="Curiosity value hook"),
            context=StructureSegment(detected=True, start_sec=3.0, end_sec=7.0, confidence=0.88, summary="Problem setup"),
            development=StructureSegment(detected=True, start_sec=7.0, end_sec=14.0, confidence=0.85, summary="3 AI tools breakdown"),
            payoff=StructureSegment(detected=True, start_sec=14.0, end_sec=17.0, confidence=0.82, summary="Time saved demonstration"),
            cta=StructureSegment(detected=True, start_sec=17.0, end_sec=18.4, confidence=0.90, summary="Save post for semester"),
            pacing_score=0.88,
        )

        emotional_profile = EmotionalProfile(
            dominant_emotion="curious",
            emotional_intensity=0.76,
            positive_score=0.82,
            negative_score=0.10,
            surprise=0.74,
            humor=0.62,
            curiosity=0.91,
            joy=0.70,
        )

        engagement_features = EngagementFeatures(
            curiosity_signal=0.91,
            relatability_signal=0.84,
            novelty_signal=0.76,
            controversy_signal=0.15,
            usefulness_signal=0.89,
            emotional_intensity_signal=0.76,
            shareability_signal=0.82,
            commentability_signal=0.68,
            saveability_signal=0.92,
        )

        capabilities = {
            "media_info": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "text_analysis": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "hook_analysis": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "visual_analysis": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "audio_analysis": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "transcript_analysis": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "structure": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "emotional_profile": AnalysisCapability(available=True, confidence=1.0, source="mock"),
            "engagement_features": AnalysisCapability(available=True, confidence=1.0, source="mock"),
        }

        from virality_lab.analyzer.schemas import AnalysisMetadata
        analysis_metadata = AnalysisMetadata(
            analysis_version="0.3.0",
            analyzers_used=["MockContentAnalyzer"],
            available_capabilities=list(capabilities.keys()),
            failed_capabilities=[],
            capabilities=capabilities,
        )

        return ContentProfile(
            content_id=content.id,
            media_info=media_info,
            text_analysis=text_analysis,
            hook_analysis=hook_analysis,
            visual_analysis=visual_analysis,
            audio_analysis=audio_analysis,
            transcript_analysis=transcript_analysis,
            structure=structure,
            emotional_profile=emotional_profile,
            engagement_features=engagement_features,
            capabilities=capabilities,
            analysis_metadata=analysis_metadata,
            metadata={"analyzer_version": "0.3.0-mock", "mode": "MOCK / DEMONSTRATION"},
        )
