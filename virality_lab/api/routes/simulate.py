"""
Audience Simulation Route.
Simulates audience agent reactions across defined personas.
"""

from fastapi import APIRouter, Depends
from virality_lab.api.dependencies import get_engine
from virality_lab.api.schemas import SimulationRequest, SimulationResponse
from virality_lab.core.content import Content
from virality_lab.engine.virality_lab_engine import ViralityLabEngine

router = APIRouter(prefix="/api", tags=["Audience Simulation"])


@router.post("/simulate", response_model=SimulationResponse, summary="Simulate Audience Reactions")
async def simulate_audience(
    request: SimulationRequest,
    engine: ViralityLabEngine = Depends(get_engine),
):
    """
    Executes audience simulation against the active persona panel.
    Returns individual behavioral probabilities, emotional states, and quotes.
    """
    content = request.content.to_content()

    selected_personas = None
    if request.target_audience and request.target_audience.selected_personas:
        selected_personas = request.target_audience.selected_personas
    elif request.personas:
        selected_personas = request.personas

    sim_res = engine.simulate(content=content, persona_names=selected_personas)

    return SimulationResponse(
        simulation_result=sim_res.model_dump(),
        agent_count=len(sim_res.reactions),
        success_rate=sim_res.success_rate,
    )
