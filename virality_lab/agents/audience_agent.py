"""
LLM-powered Audience Agent implementation.
Integrates Persona models with LLM providers to generate authentic,
grounded behavioral predictions and qualitative reasoning.
"""

from datetime import datetime, timezone
import json
import re
import time
from typing import Any, Dict, Optional, Union
from pydantic import ValidationError

from virality_lab.agents.base_agent import AudienceAgent
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.core.content import Content, Platform
from virality_lab.core.persona import Persona
from virality_lab.core.reaction import AgentExecutionMetadata, AgentFailure, Reaction
from virality_lab.llm.base import LLMProvider, LLMResponse
from virality_lab.llm.mock_provider import MockLLMProvider
from virality_lab.llm.prompt_templates import AudiencePromptBuilder


class LLMAudienceAgent(AudienceAgent):
    """
    Audience agent powered by an LLM Provider.
    Assembles persona profile, structured content intelligence, and platform context,
    prompts the provider, validates structured behavioral output, and executes bounded retries.
    """

    def __init__(
        self,
        persona: Persona,
        provider: Optional[LLMProvider] = None,
        prompt_builder: Optional[AudiencePromptBuilder] = None,
        max_retries: int = 1,
    ) -> None:
        super().__init__(persona=persona)
        self.provider: LLMProvider = provider if provider is not None else MockLLMProvider()
        self.prompt_builder = prompt_builder or AudiencePromptBuilder()
        self.max_retries = max_retries
        self.last_execution_metadata: Optional[AgentExecutionMetadata] = None

    def evaluate(
        self,
        content: Union[Content, ContentProfile],
        platform_override: Optional[Platform] = None,
        simulation_context: Optional[Dict[str, Any]] = None,
    ) -> Reaction:
        """
        Simulate audience behavior when encountering content on a feed.
        
        Args:
            content: Content item or ContentProfile to evaluate.
            platform_override: Optional platform target override.
            simulation_context: Extra metadata or contextual parameters.
            
        Returns:
            Validated Reaction instance adhering to probability bounds.
        """
        # Resolve Content and ContentProfile
        content_item: Optional[Content] = None
        profile_item: Optional[ContentProfile] = None

        if isinstance(content, Content):
            content_item = content
            profile_item = getattr(content, "profile", None)
        elif isinstance(content, ContentProfile):
            profile_item = content
        else:
            raise TypeError(f"Expected Content or ContentProfile instance, got {type(content).__name__}")

        system_prompt, user_prompt = self.prompt_builder.build_prompts(
            persona=self.persona,
            content=content_item,
            profile=profile_item,
            platform_override=platform_override,
            simulation_context=simulation_context,
        )

        start_time = time.time()
        retry_count = 0
        raw_response_text = ""
        last_error: Optional[Exception] = None

        # Primary attempt + bounded correction retries
        for attempt in range(self.max_retries + 1):
            try:
                if attempt == 0:
                    response: LLMResponse = self.provider.generate(
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                    )
                else:
                    # Correction prompt on retry
                    retry_count += 1
                    correction_user_prompt = (
                        f"{user_prompt}\n\n"
                        f"### PREVIOUS ATTEMPT FAILED VALIDATION:\n"
                        f"Error: {last_error}\n"
                        f"Previous Raw Output:\n{raw_response_text}\n\n"
                        f"Please fix all schema and formatting errors and return ONLY the valid JSON Reaction object."
                    )
                    response = self.provider.generate(
                        system_prompt=system_prompt,
                        user_prompt=correction_user_prompt,
                    )

                raw_response_text = response.content.strip()
                reaction = self._parse_and_validate_response(raw_response_text)

                latency_ms = round((time.time() - start_time) * 1000, 2)
                self.last_execution_metadata = AgentExecutionMetadata(
                    persona_name=self.persona.name,
                    provider=self.provider.__class__.__name__,
                    model_name=getattr(self.provider, "model_name", "unknown"),
                    request_timestamp=datetime.now(timezone.utc).isoformat(),
                    latency_ms=latency_ms,
                    success=True,
                    retry_count=retry_count,
                    validation_status="valid",
                )

                # Attach execution metadata to Reaction
                reaction.metadata["execution"] = self.last_execution_metadata.model_dump()
                return reaction

            except (ValidationError, ValueError, json.JSONDecodeError, KeyError) as exc:
                last_error = exc
                if attempt >= self.max_retries:
                    latency_ms = round((time.time() - start_time) * 1000, 2)
                    self.last_execution_metadata = AgentExecutionMetadata(
                        persona_name=self.persona.name,
                        provider=self.provider.__class__.__name__,
                        model_name=getattr(self.provider, "model_name", "unknown"),
                        request_timestamp=datetime.now(timezone.utc).isoformat(),
                        latency_ms=latency_ms,
                        success=False,
                        retry_count=retry_count,
                        validation_status="failed",
                    )
                    raise AgentFailure(
                        persona_name=self.persona.name,
                        error_message=f"Validation failed after {retry_count} retries: {exc}",
                        error_type=exc.__class__.__name__,
                        retry_count=retry_count,
                        raw_response=raw_response_text,
                    ) from exc
            except Exception as exc:
                # Fatal provider connection / timeout / rate limit errors
                latency_ms = round((time.time() - start_time) * 1000, 2)
                self.last_execution_metadata = AgentExecutionMetadata(
                    persona_name=self.persona.name,
                    provider=self.provider.__class__.__name__,
                    model_name=getattr(self.provider, "model_name", "unknown"),
                    request_timestamp=datetime.now(timezone.utc).isoformat(),
                    latency_ms=latency_ms,
                    success=False,
                    retry_count=retry_count,
                    validation_status="provider_error",
                )
                raise AgentFailure(
                    persona_name=self.persona.name,
                    error_message=f"Provider call failed: {exc}",
                    error_type=exc.__class__.__name__,
                    retry_count=retry_count,
                    raw_response=raw_response_text,
                ) from exc

        # Fallback unreachable guarantee
        raise AgentFailure(
            persona_name=self.persona.name,
            error_message="Agent loop exited unexpectedly.",
            retry_count=retry_count,
        )

    def _parse_and_validate_response(self, raw_text: str) -> Reaction:
        """Extract JSON from raw model string and validate against Reaction schema."""
        cleaned = raw_text.strip()

        # Handle markdown code blocks
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()

        data = json.loads(cleaned)
        if not isinstance(data, dict):
            raise ValueError(f"Expected JSON object, got {type(data).__name__}")

        # Ensure persona name is aligned
        data["persona_name"] = self.persona.name

        # Validate with Reaction Pydantic schema (validates probabilities in [0.0, 1.0])
        return Reaction.model_validate(data)
