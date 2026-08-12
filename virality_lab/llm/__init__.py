"""
LLM Provider Abstraction Layer for Virality Lab.
Allows seamlessly swapping between OpenAI, Gemini, Anthropic, local models, or Mock providers.
"""

from virality_lab.llm.base import LLMProvider, LLMResponse
from virality_lab.llm.mock_provider import MockLLMProvider
from virality_lab.llm.providers import (
    AnthropicProvider,
    GeminiProvider,
    NvidiaProvider,
    OllamaProvider,
    OpenAIProvider,
    get_llm_provider,
)
from virality_lab.llm.prompt_templates import (
    AudiencePromptBuilder,
    build_simulation_prompts,
)

__all__ = [
    "LLMProvider",
    "LLMResponse",
    "MockLLMProvider",
    "NvidiaProvider",
    "OpenAIProvider",
    "GeminiProvider",
    "AnthropicProvider",
    "OllamaProvider",
    "get_llm_provider",
    "AudiencePromptBuilder",
    "build_simulation_prompts",
]
