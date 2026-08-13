"""
Vercel Serverless Entrypoint for Virality Lab FastAPI Backend.
"""
from virality_lab.api.app import app

# Export app for Vercel Python runtime
__all__ = ["app"]
