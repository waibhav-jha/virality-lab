"""
Pre-defined audience persona definitions.
"""

from typing import List
from virality_lab.core.persona import Persona
from virality_lab.agents.personas.gen_z_student import create_gen_z_student
from virality_lab.agents.personas.casual_scroller import create_casual_scroller
from virality_lab.agents.personas.content_creator import create_content_creator
from virality_lab.agents.personas.skeptic import create_skeptic
from virality_lab.agents.personas.niche_expert import create_niche_expert


def get_default_personas() -> List[Persona]:
    """Return list of all 5 canonical Virality Lab personas."""
    return [
        create_gen_z_student(),
        create_casual_scroller(),
        create_content_creator(),
        create_skeptic(),
        create_niche_expert(),
    ]


__all__ = [
    "create_gen_z_student",
    "create_casual_scroller",
    "create_content_creator",
    "create_skeptic",
    "create_niche_expert",
    "get_default_personas",
]
