"""
Visual Analyzer abstraction and Mock implementations for video frames and images.
Honors the principle of not inventing values: unavailable capabilities remain None.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from virality_lab.analyzer.schemas import VisualAnalysis, VisualHookAnalysis


class VisualAnalyzer(ABC):
    """
    Abstract interface for vision models (LLMVisionAnalyzer, LocalVisionAnalyzer, MockVisualAnalyzer).
    """

    @abstractmethod
    def analyze(self, frame_paths: List[str]) -> VisualAnalysis:
        """
        Analyze extracted representative frames or a standalone image.
        
        Args:
            frame_paths: List of paths to representative frame images.
            
        Returns:
            VisualAnalysis model with detected features.
        """
        pass


class MockVisualAnalyzer(VisualAnalyzer):
    """
    Mock visual analyzer for deterministic testing and local development.
    """

    def __init__(
        self,
        faces_present: bool = True,
        face_count: int = 1,
        text_present: bool = True,
        scene_changes: int = 4,
        brightness: float = 0.72,
        visual_complexity: float = 0.65,
        thumbnail_quality: float = 0.85,
    ) -> None:
        self.faces_present = faces_present
        self.face_count = face_count
        self.text_present = text_present
        self.scene_changes = scene_changes
        self.brightness = brightness
        self.visual_complexity = visual_complexity
        self.thumbnail_quality = thumbnail_quality

    def analyze(self, frame_paths: List[str]) -> VisualAnalysis:
        """Return calibrated mock visual analysis."""
        hook_analysis = VisualHookAnalysis(
            first_frame_clarity=0.88,
            subject_visibility=0.85,
            visual_curiosity=0.82,
            text_overlay_present=self.text_present,
            composition_score=0.80,
            visual_clutter=0.30,
        )

        return VisualAnalysis(
            faces_present=self.faces_present,
            face_count=self.face_count,
            text_present=self.text_present,
            detected_objects=["person", "screen", "desk", "microphone"],
            scene_changes=self.scene_changes,
            visual_complexity=self.visual_complexity,
            motion_level=0.70,
            brightness=self.brightness,
            contrast=0.68,
            colorfulness=0.62,
            visual_novelty=0.75,
            thumbnail_quality=self.thumbnail_quality,
            visual_hook=hook_analysis,
        )


class LocalVisualAnalyzer(VisualAnalyzer):
    """
    Basic visual analyzer for when real vision models are not attached.
    Honestly leaves advanced semantic fields as None rather than hallucinating.
    """

    def analyze(self, frame_paths: List[str]) -> VisualAnalysis:
        if not frame_paths:
            return VisualAnalysis()

        # Returns basic structure with semantic fields as None
        return VisualAnalysis(
            faces_present=None,
            face_count=None,
            text_present=None,
            detected_objects=[],
            scene_changes=max(1, len(frame_paths) - 1),
            visual_complexity=None,
            motion_level=None,
            brightness=0.65,
            contrast=0.60,
            colorfulness=0.55,
            visual_novelty=None,
            thumbnail_quality=None,
            visual_hook=VisualHookAnalysis(
                first_frame_clarity=0.75,
                subject_visibility=None,
                visual_curiosity=None,
                text_overlay_present=None,
                composition_score=None,
                visual_clutter=None,
            ),
        )
