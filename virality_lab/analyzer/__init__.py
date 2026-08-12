"""
Multimodal Content Analysis Layer for Virality Lab.
Transforms raw social media content into structured, validated ContentProfile objects.
"""

from virality_lab.analyzer.base import AnalysisCapability, AnalysisError, ContentAnalyzer
from virality_lab.analyzer.schemas import (
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
from virality_lab.analyzer.text_analyzer import TextAnalyzer
from virality_lab.analyzer.hook_analyzer import HookAnalyzer
from virality_lab.analyzer.video_processor import ExtractedFrame, VideoMetadata, VideoProcessor
from virality_lab.analyzer.visual_analyzer import LocalVisualAnalyzer, MockVisualAnalyzer, VisualAnalyzer
from virality_lab.analyzer.audio_analyzer import AudioAnalyzer, MockTranscriptionProvider, Transcript, TranscriptionProvider
from virality_lab.analyzer.transcript_analyzer import TranscriptAnalyzer
from virality_lab.analyzer.structure_analyzer import StructureAnalyzer
from virality_lab.analyzer.emotional_analyzer import EmotionalAnalyzer
from virality_lab.analyzer.engagement_analyzer import EngagementAnalyzer
from virality_lab.analyzer.local_analyzer import LocalContentAnalyzer
from virality_lab.analyzer.mock_analyzer import MockContentAnalyzer

from virality_lab.analyzer.serializer import ContentProfileSerializer

__all__ = [
    "ContentAnalyzer",
    "AnalysisError",
    "AnalysisCapability",
    "ContentProfile",
    "ContentProfileSerializer",
    "BasicMediaInfo",
    "TextAnalysis",
    "HookAnalysis",
    "HookType",
    "VisualAnalysis",
    "VisualHookAnalysis",
    "AudioAnalysis",
    "TranscriptAnalysis",
    "StructureSegment",
    "ContentStructure",
    "EmotionalProfile",
    "EngagementFeatures",
    "TextAnalyzer",
    "HookAnalyzer",
    "VideoProcessor",
    "VideoMetadata",
    "ExtractedFrame",
    "VisualAnalyzer",
    "MockVisualAnalyzer",
    "LocalVisualAnalyzer",
    "AudioAnalyzer",
    "TranscriptionProvider",
    "MockTranscriptionProvider",
    "Transcript",
    "TranscriptAnalyzer",
    "StructureAnalyzer",
    "EmotionalAnalyzer",
    "EngagementAnalyzer",
    "LocalContentAnalyzer",
    "MockContentAnalyzer",
]
