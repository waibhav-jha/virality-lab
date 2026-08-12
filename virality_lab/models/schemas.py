"""
Unified schema re-exports and schema utilities for the Virality Lab framework.
"""

from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.core.reaction import AgentExecutionMetadata, AgentFailure, EmotionalResponse, Reaction
from virality_lab.core.simulation import SimulationResult
from virality_lab.core.scoring import ViralityScoreBreakdown
from virality_lab.analyzer.schemas import (
    AnalysisCapability,
    AnalysisMetadata,
    AudioAnalysis,
    BasicMediaInfo,
    ContentProfile,
    ContentStructure,
    EmotionalProfile,
    EngagementFeatures,
    EngagementSignals,
    HookAnalysis,
    HookType,
    StructureSegment,
    TextAnalysis,
    TranscriptAnalysis,
    VisualAnalysis,
    VisualHookAnalysis,
)

__all__ = [
    "Content",
    "Platform",
    "MediaType",
    "Persona",
    "AttentionSpan",
    "Reaction",
    "EmotionalResponse",
    "AgentExecutionMetadata",
    "AgentFailure",
    "SimulationResult",
    "ViralityScoreBreakdown",
    "ContentProfile",
    "AnalysisCapability",
    "AnalysisMetadata",
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
    "EngagementSignals",
]
