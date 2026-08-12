"""
Abstract Base Class and base interfaces for the Content Analyzer Layer.
"""

from abc import ABC, abstractmethod
from virality_lab.analyzer.schemas import AnalysisCapability, ContentProfile
from virality_lab.core.content import Content


class AnalysisError(Exception):
    """Raised when an unrecoverable error occurs in a content analyzer."""
    pass


class ContentAnalyzer(ABC):
    """
    Abstract interface for Content Analyzers.
    Subclasses convert raw Content items into structured ContentProfile objects.
    """

    @abstractmethod
    def analyze(self, content: Content) -> ContentProfile:
        """
        Analyze the provided social media content and return a structured ContentProfile.
        
        Args:
            content: The Content object to evaluate.
            
        Returns:
            ContentProfile with extracted characteristics and signals.
        """
        pass

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}>"
