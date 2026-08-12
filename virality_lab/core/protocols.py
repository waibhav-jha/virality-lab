"""
Protocols and interfaces for the Virality Lab simulation architecture.
These runtime checkable protocols enforce loose coupling between data models,
agents, simulation engines, LLM providers, and aggregators.
"""

from typing import Any, Dict, List, Optional, Protocol, Type, TypeVar, runtime_checkable
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


@runtime_checkable
class AudienceAgentProtocol(Protocol):
    """Protocol for any agent capable of evaluating content from a persona's perspective."""

    persona: Any

    def evaluate(self, content: Any) -> Any:
        """Evaluate content and return a structured Reaction."""
        ...


@runtime_checkable
class LLMProviderProtocol(Protocol):
    """Protocol for underlying LLM backends (OpenAI, Gemini, Anthropic, local models, mock)."""

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> str:
        """Generate unstructured text completion."""
        ...

    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[T],
        **kwargs: Any,
    ) -> T:
        """Generate structured completion parsed into a Pydantic model."""
        ...


@runtime_checkable
class AggregatorProtocol(Protocol):
    """Protocol for turning individual persona reactions into aggregate statistics."""

    def aggregate(self, simulation_result: Any) -> Any:
        """Aggregate a SimulationResult into an AggregateReaction."""
        ...


@runtime_checkable
class SimulationEngineProtocol(Protocol):
    """Protocol for orchestrating audience simulation against content."""

    def run(self, content: Any) -> Any:
        """Run simulation across registered agents and return SimulationResult."""
        ...


@runtime_checkable
class ScoringEngineProtocol(Protocol):
    """Protocol for virality potential score calculations."""

    def calculate_score(self, aggregated: Any) -> Any:
        """Calculate virality score breakdown from aggregate reaction."""
        ...
