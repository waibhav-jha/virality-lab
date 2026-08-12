"""
Real and Local LLM Provider implementations.
Provides decoupled, vendor-agnostic connectors for NVIDIA NIM, OpenAI, Google Gemini, Anthropic, and local Ollama.
All credentials are read securely from environment variables; zero hard-coded secrets.
"""

from datetime import datetime, timezone
import json
import os
import time
from typing import Any, Dict, Optional
import urllib.error
import urllib.request

from virality_lab.config.env import load_env
from virality_lab.llm.base import LLMProvider, LLMResponse
from virality_lab.llm.mock_provider import MockLLMProvider

# Automatically load environment variables from .env or .env.example if present
load_env()


class NvidiaProvider(LLMProvider):
    """
    Provider connector for NVIDIA NIM / NVIDIA AI Foundation Endpoints.
    Uses standard OpenAI-compatible HTTPS REST with zero external runtime dependencies.
    """

    def __init__(
        self,
        model_name: str = "meta/llama-3.1-8b-instruct",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
        timeout: float = 45.0,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, temperature=temperature, **kwargs)
        self.api_key = api_key if api_key is not None else (os.environ.get("NVIDIA_API_KEY") or os.environ.get("NVCF_API_KEY", ""))
        self.base_url = (base_url or os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")).rstrip("/")
        self.max_tokens = max_tokens
        self.timeout = timeout

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Call NVIDIA NIM /chat/completions API."""
        if not self.api_key:
            raise ValueError(
                "NVIDIA_API_KEY environment variable is not set. "
                "Set NVIDIA_API_KEY or use MockLLMProvider for offline simulation."
            )

        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": kwargs.get("model_name", self.model_name),
            "temperature": kwargs.get("temperature", self.temperature),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choice = data["choices"][0]
                content = choice["message"]["content"]
                usage = data.get("usage", {})
                finish_reason = choice.get("finish_reason")
                return LLMResponse(
                    content=content,
                    model_name=self.model_name,
                    usage=usage,
                    finish_reason=finish_reason,
                )
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"NVIDIA API error ({exc.code}): {error_body}") from exc
        except Exception as exc:
            raise RuntimeError(f"NVIDIA connection error: {exc}") from exc


class OpenAIProvider(LLMProvider):
    """
    Provider connector for OpenAI API (e.g. gpt-4o-mini, gpt-4o).
    Uses standard HTTPS REST with zero external runtime dependencies.
    """

    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        temperature: float = 0.2,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, temperature=temperature, **kwargs)
        self.api_key = api_key if api_key is not None else os.environ.get("OPENAI_API_KEY", "")
        self.base_url = (base_url or os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")).rstrip("/")
        self.timeout = timeout

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Call OpenAI chat completions API."""
        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is not set. "
                "Set OPENAI_API_KEY or use MockLLMProvider for offline simulation."
            )

        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": kwargs.get("model_name", self.model_name),
            "temperature": kwargs.get("temperature", self.temperature),
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"} if kwargs.get("json_mode", True) else None,
        }
        # Clean None values
        payload = {k: v for k, v in payload.items() if v is not None}

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choice = data["choices"][0]
                content = choice["message"]["content"]
                usage = data.get("usage", {})
                finish_reason = choice.get("finish_reason")
                return LLMResponse(
                    content=content,
                    model_name=self.model_name,
                    usage=usage,
                    finish_reason=finish_reason,
                )
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"OpenAI API error ({exc.code}): {error_body}") from exc
        except Exception as exc:
            raise RuntimeError(f"OpenAI connection error: {exc}") from exc


class GeminiProvider(LLMProvider):
    """
    Provider connector for Google Gemini API (e.g. gemini-2.5-flash, gemini-1.5-pro).
    Uses Google Generative Language REST API.
    """

    def __init__(
        self,
        model_name: str = "gemini-2.5-flash",
        api_key: Optional[str] = None,
        temperature: float = 0.2,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, temperature=temperature, **kwargs)
        self.api_key = api_key if api_key is not None else (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", ""))
        self.timeout = timeout

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Call Google Gemini REST API."""
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY (or GOOGLE_API_KEY) environment variable is not set. "
                "Set GEMINI_API_KEY or use MockLLMProvider for offline simulation."
            )

        model = kwargs.get("model_name", self.model_name)
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": kwargs.get("temperature", self.temperature),
                "responseMimeType": "application/json",
            },
        }

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini returned empty candidate response.")
                content = candidates[0]["content"]["parts"][0]["text"]
                usage = data.get("usageMetadata", {})
                finish_reason = candidates[0].get("finishReason")
                return LLMResponse(
                    content=content,
                    model_name=self.model_name,
                    usage=usage,
                    finish_reason=finish_reason,
                )
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Gemini API error ({exc.code}): {error_body}") from exc
        except Exception as exc:
            raise RuntimeError(f"Gemini connection error: {exc}") from exc


class AnthropicProvider(LLMProvider):
    """
    Provider connector for Anthropic Claude API (e.g. claude-3-5-sonnet-20241022).
    """

    def __init__(
        self,
        model_name: str = "claude-3-5-sonnet-20241022",
        api_key: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, temperature=temperature, **kwargs)
        self.api_key = api_key if api_key is not None else os.environ.get("ANTHROPIC_API_KEY", "")
        self.max_tokens = max_tokens
        self.timeout = timeout

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Call Anthropic Messages API."""
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY environment variable is not set. "
                "Set ANTHROPIC_API_KEY or use MockLLMProvider for offline simulation."
            )

        endpoint = "https://api.anthropic.com/v1/messages"
        payload = {
            "model": kwargs.get("model_name", self.model_name),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "temperature": kwargs.get("temperature", self.temperature),
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt}
            ],
        }

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text_blocks = [block["text"] for block in data.get("content", []) if block.get("type") == "text"]
                content = "".join(text_blocks)
                usage = data.get("usage", {})
                finish_reason = data.get("stop_reason")
                return LLMResponse(
                    content=content,
                    model_name=self.model_name,
                    usage=usage,
                    finish_reason=finish_reason,
                )
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Anthropic API error ({exc.code}): {error_body}") from exc
        except Exception as exc:
            raise RuntimeError(f"Anthropic connection error: {exc}") from exc


class OllamaProvider(LLMProvider):
    """
    Provider connector for local Ollama instances (e.g. llama3.2, mistral, qwen2.5).
    """

    def __init__(
        self,
        model_name: str = "llama3.2",
        base_url: Optional[str] = None,
        temperature: float = 0.2,
        timeout: float = 60.0,
        **kwargs: Any,
    ) -> None:
        super().__init__(model_name=model_name, temperature=temperature, **kwargs)
        self.base_url = (base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
        self.timeout = timeout

    def generate(self, system_prompt: str, user_prompt: str, **kwargs: Any) -> LLMResponse:
        """Call Ollama /api/generate REST endpoint with json format."""
        endpoint = f"{self.base_url}/api/generate"
        payload = {
            "model": kwargs.get("model_name", self.model_name),
            "system": system_prompt,
            "prompt": user_prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": kwargs.get("temperature", self.temperature),
            },
        }

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data.get("response", "")
                return LLMResponse(
                    content=content,
                    model_name=self.model_name,
                    usage={"eval_count": data.get("eval_count", 0), "prompt_eval_count": data.get("prompt_eval_count", 0)},
                    finish_reason="stop" if data.get("done") else None,
                )
        except Exception as exc:
            raise RuntimeError(f"Ollama connection error at {self.base_url}: {exc}") from exc


def get_llm_provider(
    provider_type: Optional[str] = None,
    model_name: Optional[str] = None,
    **kwargs: Any,
) -> LLMProvider:
    """
    Factory function to instantiate an LLMProvider based on string identifier or environment.
    
    Args:
        provider_type: "mock", "nvidia", "openai", "gemini", "anthropic", or "ollama".
                       If None, checks VIRALITY_LAB_LLM_PROVIDER (defaults to "mock").
        model_name: Optional model override.
        kwargs: Extra provider parameters (api_key, base_url, temperature, etc.).
        
    Returns:
        Configured LLMProvider instance.
    """
    ptype = (provider_type or os.environ.get("VIRALITY_LAB_LLM_PROVIDER", "mock")).lower().strip()
    model = model_name or os.environ.get("VIRALITY_LAB_LLM_MODEL")

    provider_kwargs = dict(kwargs)
    if model:
        provider_kwargs["model_name"] = model

    if ptype == "mock":
        return MockLLMProvider(**provider_kwargs)
    elif ptype in ("nvidia", "nim"):
        return NvidiaProvider(**provider_kwargs)
    elif ptype == "openai":
        return OpenAIProvider(**provider_kwargs)
    elif ptype in ("gemini", "google"):
        return GeminiProvider(**provider_kwargs)
    elif ptype in ("anthropic", "claude"):
        return AnthropicProvider(**provider_kwargs)
    elif ptype == "ollama":
        return OllamaProvider(**provider_kwargs)
    else:
        raise ValueError(
            f"Unknown provider_type '{ptype}'. "
            f"Supported providers: 'mock', 'nvidia', 'openai', 'gemini', 'anthropic', 'ollama'."
        )
