"""
Audience Agents package for Virality Lab.
"""

from virality_lab.agents.base_agent import AudienceAgent, PromptBuilder
from virality_lab.agents.mock_agent import MockAudienceAgent
from virality_lab.agents.audience_agent import LLMAudienceAgent
from virality_lab.agents.personas import (
    create_gen_z_student,
    create_casual_scroller,
    create_content_creator,
    create_skeptic,
    create_niche_expert,
    get_default_personas,
)

__all__ = [
    "AudienceAgent",
    "PromptBuilder",
    "MockAudienceAgent",
    "LLMAudienceAgent",
    "create_gen_z_student",
    "create_casual_scroller",
    "create_content_creator",
    "create_skeptic",
    "create_niche_expert",
    "get_default_personas",
]
