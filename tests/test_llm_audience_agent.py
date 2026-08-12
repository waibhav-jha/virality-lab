"""
Unit tests for LLMAudienceAgent execution, parsing, validation, retries, and error handling.
"""

import json
import pytest
from virality_lab.agents.audience_agent import LLMAudienceAgent
from virality_lab.core.content import Content, MediaType, Platform
from virality_lab.core.persona import AttentionSpan, Persona
from virality_lab.core.reaction import AgentFailure, Reaction
from virality_lab.llm.mock_provider import MockLLMProvider


@pytest.fixture
def sample_persona() -> Persona:
    return Persona(
        name="Gen-Z Student",
        age_range=(18, 24),
        attention_span=AttentionSpan.LOW,
        trend_sensitivity=0.90,
        core_interests=["AI", "College", "Gaming"],
    )


@pytest.fixture
def sample_content() -> Content:
    return Content(
        platform=Platform.INSTAGRAM_REELS,
        media_type=MediaType.SHORT_VIDEO,
        caption="5 AI tools to automate college studying in 2026 #ai",
        transcript="If you are still doing research manually, stop. Here are 3 tools.",
    )


def test_llm_audience_agent_valid_response(sample_persona: Persona, sample_content: Content):
    """Verify standard happy-path evaluation produces a validated Reaction with execution metadata."""
    agent = LLMAudienceAgent(persona=sample_persona)
    reaction = agent.evaluate(sample_content)

    assert isinstance(reaction, Reaction)
    assert reaction.persona_name == sample_persona.name
    assert 0.0 <= reaction.stop_scroll <= 1.0
    assert 0.0 <= reaction.watch_probability <= 1.0
    assert 0.0 <= reaction.share_probability <= 1.0
    assert reaction.emotional_response in ["entertained", "curious", "skeptical", "indifferent", "inspired"]
    assert len(reaction.reasoning) > 10

    # Verify execution observability metadata
    assert "execution" in reaction.metadata
    meta = reaction.metadata["execution"]
    assert meta["persona_name"] == sample_persona.name
    assert meta["success"] is True
    assert meta["retry_count"] == 0
    assert meta["latency_ms"] >= 0.0


def test_llm_audience_agent_markdown_codeblock_parsing(sample_persona: Persona, sample_content: Content):
    """Verify JSON enclosed inside markdown code fences is extracted cleanly."""
    valid_payload = json.dumps({
        "persona_name": sample_persona.name,
        "stop_scroll": 0.85,
        "watch_probability": 0.75,
        "completion_probability": 0.60,
        "like_probability": 0.70,
        "comment_probability": 0.40,
        "share_probability": 0.80,
        "save_probability": 0.50,
        "follow_probability": 0.30,
        "emotional_response": "curious",
        "strengths": ["Fast hook"],
        "weaknesses": ["Pacing"],
        "reasoning": "Strong opening caught my eye immediately.",
    })

    markdown_response = f"Here is my simulated reaction:\n```json\n{valid_payload}\n```\nHope this helps!"
    provider = MockLLMProvider(predefined_responses=[markdown_response])
    agent = LLMAudienceAgent(persona=sample_persona, provider=provider)

    reaction = agent.evaluate(sample_content)
    assert reaction.stop_scroll == 0.85
    assert reaction.share_probability == 0.80
    assert reaction.emotional_response == "curious"


def test_llm_audience_agent_retry_on_malformed_json(sample_persona: Persona, sample_content: Content):
    """Verify agent retries on malformed JSON and succeeds when second attempt is valid."""
    malformed_first = "This is not valid JSON at all {broken"
    valid_second = json.dumps({
        "persona_name": sample_persona.name,
        "stop_scroll": 0.90,
        "watch_probability": 0.80,
        "completion_probability": 0.70,
        "like_probability": 0.65,
        "comment_probability": 0.50,
        "share_probability": 0.75,
        "save_probability": 0.40,
        "follow_probability": 0.20,
        "emotional_response": "excited",
        "strengths": ["Clean structure"],
        "weaknesses": [],
        "reasoning": "Corrected and valid response.",
    })

    provider = MockLLMProvider(predefined_responses=[malformed_first, valid_second])
    agent = LLMAudienceAgent(persona=sample_persona, provider=provider, max_retries=1)

    reaction = agent.evaluate(sample_content)
    assert reaction.stop_scroll == 0.90
    assert reaction.metadata["execution"]["retry_count"] == 1
    assert reaction.metadata["execution"]["success"] is True


def test_llm_audience_agent_agent_failure_on_repeated_errors(sample_persona: Persona, sample_content: Content):
    """Verify agent raises AgentFailure when all retry attempts fail."""
    malformed_1 = "Bad output 1"
    malformed_2 = "Bad output 2"

    provider = MockLLMProvider(predefined_responses=[malformed_1, malformed_2])
    agent = LLMAudienceAgent(persona=sample_persona, provider=provider, max_retries=1)

    with pytest.raises(AgentFailure) as exc_info:
        agent.evaluate(sample_content)

    assert exc_info.value.persona_name == sample_persona.name
    assert exc_info.value.retry_count == 1
    assert "Validation failed" in exc_info.value.error_message


def test_llm_audience_agent_invalid_type_raises():
    """Verify passing non-Content raises TypeError."""
    persona = Persona(name="Tester")
    agent = LLMAudienceAgent(persona=persona)

    with pytest.raises(TypeError):
        agent.evaluate("not a content item")  # type: ignore
