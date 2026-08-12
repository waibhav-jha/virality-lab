"""
Health Check and Service Diagnostics Endpoint.
"""

from fastapi import APIRouter, Depends
from virality_lab.api.dependencies import get_app_config
from virality_lab.config.app_config import AppConfig

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health Check")
async def health_check(config: AppConfig = Depends(get_app_config)):
    """
    Returns server operational status and simulation execution mode.
    """
    return {
        "status": "ok",
        "service": "Virality Lab API",
        "version": "0.7.0",
        "simulation_mode": config.simulation_mode,
        "environment": config.environment,
    }
