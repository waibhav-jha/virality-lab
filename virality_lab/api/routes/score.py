"""
Virality Potential Scoring Route.
Translates simulated audience reactions into calibrated scores, confidence, and diagnostics.
"""

from fastapi import APIRouter, Depends
from virality_lab.analyzer.schemas import ContentProfile
from virality_lab.api.dependencies import get_engine
from virality_lab.api.schemas import ScoreRequest, ScoreResponse
from virality_lab.core.simulation import SimulationResult
from virality_lab.engine.virality_lab_engine import ViralityLabEngine

router = APIRouter(prefix="/api", tags=["Virality Scoring"])


@router.post("/score", response_model=ScoreResponse, summary="Score Simulation Reactions")
async def score_simulation(
    request: ScoreRequest,
    engine: ViralityLabEngine = Depends(get_engine),
):
    """
    Computes component breakdown (Retention, Sharing, Engagement, Conversion),
    audience agreement, and actionable diagnostics from simulation results.
    """
    sim_result = SimulationResult.model_validate(request.simulation_result)

    profile = None
    if request.content_profile:
        profile = ContentProfile.model_validate(request.content_profile)

    score = engine.score(
        simulation_result=sim_result,
        profile=profile,
        platform=request.platform,
    )

    return ScoreResponse(
        virality_score=score.model_dump(),
        overall_score=score.overall_score,
        strongest_dimension=score.diagnostics.strongest_dimension if score.diagnostics else "retention",
        weakest_dimension=score.diagnostics.weakest_dimension if score.diagnostics else "conversion",
    )
