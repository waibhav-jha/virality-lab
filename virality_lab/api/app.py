"""
FastAPI Application Entrypoint for Virality Lab.
Assembles routers, CORS middleware, global exception handlers, and OpenAPI documentation metadata.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from virality_lab.api.errors import register_exception_handlers
from virality_lab.api.routes import analyze, health, optimize, runs, score, simulate, upload
from virality_lab.config.app_config import AppConfig


def create_app(config: AppConfig = None) -> FastAPI:
    """FastAPI Application Factory."""
    app_config = config or AppConfig.from_env()

    app = FastAPI(
        title="Virality Lab API",
        description=(
            "AI-Powered Content Simulation & Optimization Engine API. "
            "Simulates multi-agent audience reactions, predicts virality potential, "
            "diagnoses retention drop-offs, and generates targeted content variants."
        ),
        version="0.7.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS Middleware (permits local and future web UI origins)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register standard error handlers
    register_exception_handlers(app)

    # Register API routers
    app.include_router(health.router)
    app.include_router(analyze.router)
    app.include_router(simulate.router)
    app.include_router(score.router)
    app.include_router(optimize.router)
    app.include_router(runs.router)
    app.include_router(upload.router)

    return app


# Default app instance for uvicorn
app = create_app()
