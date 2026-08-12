"""
Audio Analyzer and Transcription Provider abstractions.
Extracts audio stream characteristics and manages speech-to-text interfaces.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field

from virality_lab.analyzer.schemas import AudioAnalysis


class Transcript(BaseModel):
    """Container for transcribed dialogue with optional timestamps."""

    text: str = Field(..., description="Full transcribed text.")
    language: str = Field(default="en")
    segments: List[dict] = Field(default_factory=list, description="Word or phrase level timestamps.")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)


class TranscriptionProvider(ABC):
    """
    Abstract interface for speech transcription engines (Whisper, Gemini, Deepgram, Mock).
    """

    @abstractmethod
    def transcribe(self, audio_path: str) -> Optional[Transcript]:
        """Transcribe an audio file into text."""
        pass


class MockTranscriptionProvider(TranscriptionProvider):
    """
    Mock speech transcription provider for offline operation.
    """

    def __init__(self, predefined_text: Optional[str] = None) -> None:
        self.predefined_text = predefined_text

    def transcribe(self, audio_path: str) -> Optional[Transcript]:
        text = self.predefined_text or "This is a simulated transcript extracted from the audio stream."
        return Transcript(text=text, language="en", confidence=0.98)


class AudioAnalyzer:
    """
    Analyzes audio streams and integrates with transcription providers.
    """

    def __init__(self, transcription_provider: Optional[TranscriptionProvider] = None) -> None:
        self.transcription_provider = transcription_provider

    def analyze(
        self,
        audio_path: Optional[str] = None,
        duration_sec: Optional[float] = None,
        has_audio_stream: bool = False,
    ) -> AudioAnalysis:
        """
        Analyze audio file properties and speech metrics.
        """
        if not audio_path and not has_audio_stream:
            return AudioAnalysis(has_audio=False)

        # Baseline audio characteristics
        return AudioAnalysis(
            has_audio=True,
            duration_sec=duration_sec,
            speech_present=True,
            music_present=True,
            silence_ratio=0.08,
            speech_rate_wpm=155.0,
            energy_level=0.78,
        )
