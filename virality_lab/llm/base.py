"""
Abstract base class for Large Language Model (LLM) providers.
Agents interact exclusively with this abstraction, decoupling simulation logic
from concrete model vendors (OpenAI, Anthropic, Gemini, Ollama, vLLM, etc.).
"""

from abc import ABC, abstractmethod
import json
import re
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T", bound=BaseModel)


class LLMResponse(BaseModel):
    """Container for raw LLM text outputs and provider execution metadata."""

    content: str = Field(..., description="Raw text response from the model.")
    model_name: str = Field(default="unknown", description="Model identifier used for generation.")
    usage: Dict[str, Any] = Field(default_factory=dict, description="Token consumption metadata.")
    finish_reason: Optional[str] = Field(default=None, description="Completion finish reason.")


class LLMProvider(ABC):
    """
    Abstract LLM Provider interface.
    Subclasses implement vendor-specific API calls (e.g. OpenAIProvider, GeminiProvider).
    """

    def __init__(self, model_name: str = "default", temperature: float = 0.7, **kwargs: Any) -> None:
        self.model_name = model_name
        self.temperature = temperature
        self.config = kwargs

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """
        Generate text output from system and user prompt strings.
        
        Args:
            system_prompt: High-level instructions and persona identity.
            user_prompt: Content details and evaluation task.
            kwargs: Runtime overrides (temperature, max_tokens, etc.).
            
        Returns:
            LLMResponse containing raw text and metadata.
        """
        pass

    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[T],
        **kwargs: Any,
    ) -> T:
        """
        Generate structured output adhering to a Pydantic schema.
        Default implementation requests JSON in the prompt and parses response,
        or subclasses can override with native JSON mode / function calling / structured outputs.
        """
        schema_json = json.dumps(response_model.model_json_schema(), indent=2)
        augmented_system = (
            f"{system_prompt}\n\n"
            f"You MUST respond ONLY with a valid JSON object matching this schema:\n{schema_json}"
        )

        response = self.generate(system_prompt=augmented_system, user_prompt=user_prompt, **kwargs)
        raw_text = response.content.strip()

        # Extract JSON if enclosed in markdown code fences
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
        if match:
            raw_text = match.group(1).strip()

        try:
            data = json.loads(raw_text)
            return response_model.model_validate(data)
        except Exception as exc:
            raise ValueError(
                f"Failed to parse LLM response into {response_model.__name__}: {exc}\nRaw Response:\n{response.content}"
            ) from exc
