"""
Virality Scoring & Audience Intelligence Engine package.
Provides deterministic virality scoring, audience aggregation,
agreement/polarization analysis, and rule-based diagnostics.
"""

from virality_lab.scoring.aggregator import AudienceAggregator
from virality_lab.scoring.calibration import BaseScoringEngine
from virality_lab.scoring.config import MetricSubWeights, ScoringConfig
from virality_lab.scoring.engine import ViralityScoringEngine
from virality_lab.scoring.explanation import ExplanationEngine
from virality_lab.scoring.schemas import (
    AudienceAgreement,
    AudienceSummary,
    ComponentScores,
    MetricDistribution,
    PersonaScore,
    ScoreConfidence,
    ScoreDiagnostics,
    ScoreExplanation,
    ViralityScore,
)

__all__ = [
    "AudienceAggregator",
    "BaseScoringEngine",
    "ScoringConfig",
    "MetricSubWeights",
    "ViralityScoringEngine",
    "ExplanationEngine",
    "AudienceAgreement",
    "AudienceSummary",
    "ComponentScores",
    "MetricDistribution",
    "PersonaScore",
    "ScoreConfidence",
    "ScoreDiagnostics",
    "ScoreExplanation",
    "ViralityScore",
]
