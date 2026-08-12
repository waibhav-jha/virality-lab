"""
Base interfaces and extension points for calibrated scoring engines.
Enables pluggable transition from heuristic models to empirically calibrated or ML models.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional

from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.simulation import SimulationResult
from virality_lab.scoring.config import ScoringConfig
from virality_lab.scoring.schemas import ViralityScore


class BaseScoringEngine(ABC):
    """
    Abstract interface for scoring engines in Virality Lab.
    All scoring engines convert a SimulationResult into a validated ViralityScore.
    """

    @abstractmethod
    def score(
        self,
        simulation_result: SimulationResult,
        content_profile: Optional[ContentProfile] = None,
        context: Optional[Any] = None,
        target_audience: Optional[str] = None,
    ) -> ViralityScore:
        """
        Calculate a ViralityScore from simulation results and optional context.
        """
        pass
