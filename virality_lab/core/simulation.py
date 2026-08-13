"""
Simulation Engine coordinating audience persona evaluations against standardized content.
Ensures fault isolation and preserves raw agent reactions for explainability.
"""

from datetime import datetime, timezone
import concurrent.futures
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from virality_lab.core.content import Content
from virality_lab.core.reaction import Reaction
from virality_lab.core.protocols import AudienceAgentProtocol


class SimulationResult(BaseModel):
    """
    Structured outcome of an audience simulation run.
    Preserves all individual persona reactions for deep explainability and subsequent aggregation.
    """

    content_id: str = Field(..., description="Unique ID of the evaluated content item.")
    reactions: List[Reaction] = Field(default_factory=list, description="List of validated persona reactions.")
    failed_agents: List[Dict[str, str]] = Field(default_factory=list, description="Audit log of any agents that failed during execution.")
    total_agents: Optional[int] = Field(default=None, description="Total expected agent count (defaults to reactions + failures).")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Run metadata, timestamps, and execution counts.")

    def get_reaction_by_persona(self, persona_name: str) -> Optional[Reaction]:
        """Lookup reaction for a specific persona name."""
        for reaction in self.reactions:
            if reaction.persona_name.lower() == persona_name.lower():
                return reaction
        return None

    @property
    def total_reactions(self) -> int:
        """Total successful persona reactions collected."""
        return len(self.reactions)

    @property
    def total_evaluated(self) -> int:
        """Total successful persona evaluations."""
        return len(self.reactions)

    @property
    def total_expected(self) -> int:
        """Total expected agents."""
        if self.total_agents is not None:
            return self.total_agents
        return len(self.reactions) + len(self.failed_agents)

    @property
    def success_rate(self) -> float:
        """Percentage of agents that successfully returned a valid reaction."""
        total = self.total_expected
        return round(len(self.reactions) / total, 4) if total > 0 else 0.0


class SimulationEngine:
    """
    Engine that dispatches content to a pool of audience agents,
    collects individual reactions, and constructs a SimulationResult.
    """

    def __init__(self, agents: Optional[List[AudienceAgentProtocol]] = None) -> None:
        self.agents: List[AudienceAgentProtocol] = list(agents) if agents is not None else []

    def add_agent(self, agent: AudienceAgentProtocol) -> None:
        """Register a new audience agent into the simulation pool."""
        self.agents.append(agent)

    def set_agents(self, agents: List[AudienceAgentProtocol]) -> None:
        """Replace the current pool of agents."""
        self.agents = list(agents)

    def clear_agents(self) -> None:
        """Clear all registered agents."""
        self.agents.clear()

    # Alias for run()
    def simulate(
        self,
        content: Content,
        fail_fast: bool = False,
        concurrent: bool = False,
        max_workers: int = 5,
        **kwargs: Any,
    ) -> SimulationResult:
        """Alias for run() to support engine interfaces."""
        return self.run(content=content, fail_fast=fail_fast, concurrent=concurrent, max_workers=max_workers)

    def run(
        self,
        content: Content,
        fail_fast: bool = False,
        concurrent: bool = False,
        max_workers: int = 5,
    ) -> SimulationResult:
        """
        Execute simulation across all registered audience agents.
        
        Args:
            content: The standardized Content item to evaluate.
            fail_fast: If True, raises exceptions on agent failure; if False, logs error and continues.
            concurrent: If True, executes agent evaluations in parallel via ThreadPoolExecutor.
            max_workers: Number of worker threads for parallel evaluation.
            
        Returns:
            SimulationResult containing all individual validated reactions.
        """
        if not isinstance(content, Content):
            raise TypeError(f"Expected instance of Content, got {type(content).__name__}")

        if not self.agents:
            raise ValueError("No audience agents registered in the SimulationEngine.")

        reactions: List[Reaction] = []
        failed_agents: List[Dict[str, str]] = []
        start_time = time.time()

        def _evaluate_agent(agent: AudienceAgentProtocol) -> Reaction:
            raw_reaction = agent.evaluate(content)
            if isinstance(raw_reaction, Reaction):
                return raw_reaction
            elif isinstance(raw_reaction, dict):
                return Reaction.model_validate(raw_reaction)
            else:
                raise ValueError(f"Agent returned unsupported reaction type: {type(raw_reaction).__name__}")

        if concurrent and len(self.agents) > 1:
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(max_workers, len(self.agents))) as executor:
                future_to_agent = {
                    executor.submit(_evaluate_agent, agent): agent for agent in self.agents
                }
                for future in future_to_agent:
                    agent = future_to_agent[future]
                    agent_persona_name = getattr(getattr(agent, "persona", None), "name", str(agent))
                    try:
                        reaction = future.result()
                        reactions.append(reaction)
                    except Exception as exc:
                        if fail_fast:
                            raise exc
                        failed_agents.append({
                            "persona": agent_persona_name,
                            "error": str(exc),
                            "error_type": exc.__class__.__name__,
                        })
        else:
            for agent in self.agents:
                agent_persona_name = getattr(getattr(agent, "persona", None), "name", str(agent))
                try:
                    reaction = _evaluate_agent(agent)
                    reactions.append(reaction)
                except Exception as exc:
                    if fail_fast:
                        raise exc
                    failed_agents.append({
                        "persona": agent_persona_name,
                        "error": str(exc),
                        "error_type": exc.__class__.__name__,
                    })

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return SimulationResult(
            content_id=content.id,
            reactions=reactions,
            failed_agents=failed_agents,
            metadata={
                "number_of_agents": len(self.agents),
                "successful_evaluations": len(reactions),
                "failed_evaluations": len(failed_agents),
                "duration_ms": duration_ms,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "platform": content.platform.value,
                "media_type": content.media_type.value,
                "concurrent": concurrent,
            },
        )

