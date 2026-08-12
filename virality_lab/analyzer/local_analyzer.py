"""
Local Content Analyzer implementing a modular, fault-tolerant analysis pipeline.
Integrates text, video metadata, audio, hook, structure, emotional, and engagement analyzers.
"""

from typing import Optional
from virality_lab.analyzer.audio_analyzer import AudioAnalyzer
from virality_lab.analyzer.base import ContentAnalyzer
from virality_lab.analyzer.emotional_analyzer import EmotionalAnalyzer
from virality_lab.analyzer.engagement_analyzer import EngagementAnalyzer
from virality_lab.analyzer.hook_analyzer import HookAnalyzer
from virality_lab.analyzer.schemas import (
    AnalysisCapability,
    BasicMediaInfo,
    ContentProfile,
)
from virality_lab.analyzer.structure_analyzer import StructureAnalyzer
from virality_lab.analyzer.text_analyzer import TextAnalyzer
from virality_lab.analyzer.transcript_analyzer import TranscriptAnalyzer
from virality_lab.analyzer.video_processor import VideoProcessor
from virality_lab.analyzer.visual_analyzer import LocalVisualAnalyzer, VisualAnalyzer
from virality_lab.core.content import Content, MediaType


class LocalContentAnalyzer(ContentAnalyzer):
    """
    Modular, offline-capable Content Analyzer pipeline.
    Executes staged feature extraction and populates a validated ContentProfile.
    """

    def __init__(
        self,
        video_processor: Optional[VideoProcessor] = None,
        visual_analyzer: Optional[VisualAnalyzer] = None,
        audio_analyzer: Optional[AudioAnalyzer] = None,
        text_analyzer: Optional[TextAnalyzer] = None,
        hook_analyzer: Optional[HookAnalyzer] = None,
        transcript_analyzer: Optional[TranscriptAnalyzer] = None,
        structure_analyzer: Optional[StructureAnalyzer] = None,
        emotional_analyzer: Optional[EmotionalAnalyzer] = None,
        engagement_analyzer: Optional[EngagementAnalyzer] = None,
    ) -> None:
        self.video_processor = video_processor or VideoProcessor()
        self.visual_analyzer = visual_analyzer or LocalVisualAnalyzer()
        self.audio_analyzer = audio_analyzer or AudioAnalyzer()
        self.text_analyzer = text_analyzer or TextAnalyzer()
        self.hook_analyzer = hook_analyzer or HookAnalyzer()
        self.transcript_analyzer = transcript_analyzer or TranscriptAnalyzer()
        self.structure_analyzer = structure_analyzer or StructureAnalyzer()
        self.emotional_analyzer = emotional_analyzer or EmotionalAnalyzer()
        self.engagement_analyzer = engagement_analyzer or EngagementAnalyzer()

    def analyze(self, content: Content) -> ContentProfile:
        """
        Execute the staged analysis pipeline on a Content item.
        """
        if not isinstance(content, Content):
            raise TypeError(f"Expected instance of Content, got {type(content).__name__}")

        capabilities = {}

        # 1. Basic Media Metadata
        media_info = BasicMediaInfo(
            platform=content.platform,
            media_type=content.media_type,
            language="en",
        )

        duration_sec = None
        has_video_file = bool(content.media_path and content.media_type in [MediaType.SHORT_VIDEO, MediaType.AUDIO])

        if has_video_file:
            try:
                v_meta = self.video_processor.get_metadata(content.media_path)
                media_info.duration_sec = v_meta.duration_sec
                media_info.width = v_meta.width
                media_info.height = v_meta.height
                media_info.aspect_ratio = v_meta.aspect_ratio
                media_info.fps = v_meta.fps
                media_info.codec = v_meta.codec
                media_info.file_size_bytes = v_meta.file_size_bytes
                duration_sec = v_meta.duration_sec
                capabilities["video_metadata"] = AnalysisCapability(available=True, confidence=0.95, source="video_processor")
            except Exception as e:
                capabilities["video_metadata"] = AnalysisCapability(available=False, confidence=0.0, source=f"error: {e}")
        else:
            # Fallback duration from metadata if present
            duration_sec = content.metadata.get("duration_sec", 15.0 if content.media_type == MediaType.SHORT_VIDEO else None)
            media_info.duration_sec = duration_sec
            capabilities["video_metadata"] = AnalysisCapability(
                available=duration_sec is not None,
                confidence=0.85 if duration_sec else 0.0,
                source="metadata_inference" if duration_sec else "not_applicable",
            )

        # 2. Text & Caption Analysis
        text_analysis = self.text_analyzer.analyze(content.caption)
        capabilities["text_analysis"] = AnalysisCapability(
            available=bool(content.caption),
            confidence=0.95 if content.caption else 0.0,
            source="heuristic_nlp",
        )

        # 3. Transcript Analysis
        transcript_analysis = self.transcript_analyzer.analyze(content.transcript, duration_sec=duration_sec)
        capabilities["transcript_analysis"] = AnalysisCapability(
            available=bool(content.transcript),
            confidence=0.95 if content.transcript else 0.0,
            source="text_heuristics" if content.transcript else "missing_transcript",
        )

        # 4. Hook Analysis
        hook_duration_sec = content.metadata.get("hook_duration_sec", 3.0)
        hook_analysis = self.hook_analyzer.analyze(
            transcript=content.transcript,
            caption=content.caption,
            hook_duration_sec=hook_duration_sec,
        )
        capabilities["hook_analysis"] = AnalysisCapability(
            available=bool(hook_analysis.hook_text),
            confidence=0.90 if hook_analysis.hook_text else 0.40,
            source="heuristic_pattern_matcher",
        )

        # 5. Visual Analysis
        frames = []
        if has_video_file:
            try:
                frames = self.video_processor.extract_frames(content.media_path)
            except Exception:
                frames = []
        frame_paths = [f.frame_path for f in frames if f.frame_path]
        visual_analysis = self.visual_analyzer.analyze(frame_paths)
        capabilities["visual_analysis"] = AnalysisCapability(
            available=bool(frame_paths),
            confidence=0.75 if frame_paths else 0.0,
            source="local_visual_analyzer" if frame_paths else "unavailable_vision_model",
        )

        # 6. Audio Analysis
        audio_analysis = self.audio_analyzer.analyze(
            audio_path=content.media_path if has_video_file else None,
            duration_sec=duration_sec,
            has_audio_stream=content.media_type in [MediaType.SHORT_VIDEO, MediaType.AUDIO],
        )
        capabilities["audio_analysis"] = AnalysisCapability(
            available=audio_analysis.has_audio,
            confidence=0.85 if audio_analysis.has_audio else 0.0,
            source="audio_stream_detector",
        )

        # 7. Content Structure Analysis
        structure = self.structure_analyzer.analyze(
            duration_sec=duration_sec,
            transcript_text=content.transcript,
            cta_present=text_analysis.cta_present,
        )
        capabilities["structure_analysis"] = AnalysisCapability(
            available=True,
            confidence=structure.hook.confidence,
            source="short_form_pacing_model",
        )

        # 8. Emotional Profile
        emotional_profile = self.emotional_analyzer.analyze(
            text_analysis=text_analysis,
            hook_analysis=hook_analysis,
        )
        capabilities["emotional_profile"] = AnalysisCapability(available=True, confidence=0.85, source="linguistic_heuristics")

        # 9. Engagement Signals (Layer 2)
        engagement_features = self.engagement_analyzer.analyze(
            text_analysis=text_analysis,
            hook_analysis=hook_analysis,
            visual_analysis=visual_analysis,
        )
        capabilities["engagement_features"] = AnalysisCapability(available=True, confidence=0.88, source="behavioral_affordance_model")

        # Build AnalysisMetadata summary
        available_caps = [k for k, v in capabilities.items() if v.available]
        failed_caps = [k for k, v in capabilities.items() if not v.available]
        analyzers_used = [
            "TextAnalyzer",
            "TranscriptAnalyzer",
            "HookAnalyzer",
            self.visual_analyzer.__class__.__name__,
            self.audio_analyzer.__class__.__name__,
            "StructureAnalyzer",
            "EmotionalAnalyzer",
            "EngagementAnalyzer",
        ]
        if has_video_file:
            analyzers_used.append("VideoProcessor")

        from virality_lab.analyzer.schemas import AnalysisMetadata
        analysis_metadata = AnalysisMetadata(
            analysis_version="0.3.0",
            analyzers_used=analyzers_used,
            available_capabilities=available_caps,
            failed_capabilities=failed_caps,
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
            metadata={"analyzer_version": "0.3.0-local"},
        )
