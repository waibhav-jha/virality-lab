"""
Configuration package for personas and simulation parameters.
"""

from virality_lab.config.loader import (
    load_personas_from_yaml,
    load_default_personas,
    create_agent_from_persona,
    create_default_agents,
)

__all__ = [
    "load_personas_from_yaml",
    "load_default_personas",
    "create_agent_from_persona",
    "create_default_agents",
]
