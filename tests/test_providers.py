"""
Unit tests for LLM provider abstractions and get_llm_provider factory.
"""

import pytest
from virality_lab.llm.base import LLMResponse
from virality_lab.llm.mock_provider import MockLLMProvider
from virality_lab.llm.providers import (
    AnthropicProvider,
    GeminiProvider,
    NvidiaProvider,
    OllamaProvider,
    OpenAIProvider,
    get_llm_provider,
)


def test_mock_llm_provider_generation():
    """Verify MockLLMProvider generates valid responses and tracks history."""
    provider = MockLLMProvider(model_name="mock-test")
    resp = provider.generate(system_prompt="### PERSONA: Skeptic", user_prompt="Test user")

    assert isinstance(resp, LLMResponse)
    assert "skeptic" in resp.content.lower()
    assert len(provider.call_history) == 1


def test_get_llm_provider_factory():
    """Verify get_llm_provider instantiates correct classes based on string tags."""
    p_mock = get_llm_provider("mock")
    assert isinstance(p_mock, MockLLMProvider)

    p_nvidia = get_llm_provider("nvidia", api_key="dummy-nv-key")
    assert isinstance(p_nvidia, NvidiaProvider)
    assert "meta/llama" in p_nvidia.model_name

    p_openai = get_llm_provider("openai", api_key="dummy-key")
    assert isinstance(p_openai, OpenAIProvider)

    p_gemini = get_llm_provider("gemini", api_key="dummy-key")
    assert isinstance(p_gemini, GeminiProvider)

    p_anthropic = get_llm_provider("anthropic", api_key="dummy-key")
    assert isinstance(p_anthropic, AnthropicProvider)

    p_ollama = get_llm_provider("ollama")
    assert isinstance(p_ollama, OllamaProvider)


def test_get_llm_provider_unknown_raises():
    """Verify passing invalid provider type raises ValueError."""
    with pytest.raises(ValueError) as exc:
        get_llm_provider("unknown-vendor")
    assert "Unknown provider_type" in str(exc.value)


def test_real_providers_missing_key_error():
    """Verify calling generate on real providers without API keys raises clean descriptive ValueError."""
    nvidia = NvidiaProvider(api_key="")
    with pytest.raises(ValueError) as exc:
        nvidia.generate("system", "user")
    assert "NVIDIA_API_KEY" in str(exc.value)

    openai = OpenAIProvider(api_key="")
    with pytest.raises(ValueError) as exc:
        openai.generate("system", "user")
    assert "OPENAI_API_KEY" in str(exc.value)

    gemini = GeminiProvider(api_key="")
    with pytest.raises(ValueError) as exc:
        gemini.generate("system", "user")
    assert "GEMINI_API_KEY" in str(exc.value)

    anthropic = AnthropicProvider(api_key="")
    with pytest.raises(ValueError) as exc:
        anthropic.generate("system", "user")
    assert "ANTHROPIC_API_KEY" in str(exc.value)
