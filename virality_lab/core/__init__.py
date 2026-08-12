"""
Core data models and protocols for the Virality Lab framework.
"""

from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.core.reaction import EmotionalResponse, Reaction
from virality_lab.core.simulation import SimulationEngine, SimulationResult
from virality_lab.core.scoring import ViralityScoreBreakdown, ScoringEngine
from virality_lab.core.protocols import (
    AudienceAgentProtocol,
    LLMProviderProtocol,
    AggregatorProtocol,
    SimulationEngineProtocol,
)

__all__ = [
    "Content",
    "Platform",
    "MediaType",
    "Persona",
    "AttentionSpan",
    "Reaction",
    "EmotionalResponse",
    "SimulationEngine",
    "SimulationResult",
    "ViralityScoreBreakdown",
    "ScoringEngine",
    "AudienceAgentProtocol",
    "LLMProviderProtocol",
    "AggregatorProtocol",
    "SimulationEngineProtocol",
]
