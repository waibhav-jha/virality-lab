"""
Structured Reaction schema representing an agent's behavioral prediction and explanation.
Strictly separates quantitative behavioral predictions from qualitative reasoning.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EmotionalResponse(str, Enum):
    """Primary simulated emotional reaction to content."""

    CURIOUS = "curious"
    ENTERTAINED = "entertained"
    INSPIRED = "inspired"
    SKEPTICAL = "skeptical"
    BORED = "bored"
    ANNOYED = "annoyed"
    INDIFFERENT = "indifferent"
    CONFUSED = "confused"
    SURPRISED = "surprised"
    AMUSED = "amused"


class Reaction(BaseModel):
    """
    Validated behavioral reaction output from an audience persona.
    Combines machine-readable action probabilities with qualitative reasoning.
    """

    persona_name: str = Field(..., description="Name of the persona that produced this reaction.")

    # Behavioral Predictions (0.0 to 1.0 probabilities)
    stop_scroll: float = Field(..., ge=0.0, le=1.0, description="Probability the persona stops scrolling at first glance (0-1).")
    watch_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of watching past the first 3-5 seconds (0-1).")
    completion_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of consuming content to completion (0-1).")

    like_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of giving a like/upvote (0-1).")
    comment_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of leaving a comment (0-1).")
    share_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of sharing with friends/network (0-1).")
    save_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of bookmarking/saving for later (0-1).")
    follow_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of following the creator profile (0-1).")

    # Qualitative Assessment
    emotional_response: str = Field(default=EmotionalResponse.CURIOUS.value, description="Primary emotional reaction.")
    strengths: List[str] = Field(default_factory=list, description="Specific elements that worked well for this persona.")
    weaknesses: List[str] = Field(default_factory=list, description="Points of friction or causes for scrolling away.")
    reasoning: str = Field(..., description="In-depth explanation of why the persona exhibited these behaviors.")
    simulated_comment: Optional[str] = Field(default=None, description="In-character simulated social media comment from this persona.")

    # Context & Diagnostics
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Execution diagnostics, latency, or model details.")

    def summary_table_row(self) -> Dict[str, Any]:
        """Convenience method for formatted tabular output."""
        return {
            "Persona": self.persona_name,
            "Stop Scroll": f"{self.stop_scroll:.2f}",
            "Watch": f"{self.watch_probability:.2f}",
            "Complete": f"{self.completion_probability:.2f}",
            "Like": f"{self.like_probability:.2f}",
            "Share": f"{self.share_probability:.2f}",
            "Comment": f"{self.comment_probability:.2f}",
            "Emotion": self.emotional_response,
        }


class AgentExecutionMetadata(BaseModel):
    """Observability metadata for an individual agent execution."""

    persona_name: str
    provider: str
    model_name: str
    request_timestamp: str
    latency_ms: float
    success: bool
    retry_count: int = 0
    validation_status: str = "valid"


class AgentFailure(Exception):
    """Structured exception raised when an agent fails evaluation after all retries."""

    def __init__(
        self,
        persona_name: str,
        error_message: str,
        error_type: str = "AgentEvaluationError",
        retry_count: int = 0,
        raw_response: Optional[str] = None,
    ) -> None:
        super().__init__(f"Agent [{persona_name}] failed: {error_message}")
        self.persona_name = persona_name
        self.error_message = error_message
        self.error_type = error_type
        self.retry_count = retry_count
        self.raw_response = raw_response

