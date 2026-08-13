FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user (required for Hugging Face Spaces, good practice for security)
RUN useradd -m -u 1000 user && \
    mkdir -p /tmp/virality_media && \
    chown -R user:user /tmp/virality_media /app

USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860 \
    PYTHONUNBUFFERED=1 \
    SIMULATION_MODE=mock \
    MEDIA_STORAGE_DIR=/tmp/virality_media

# Copy application files
COPY --chown=user:user virality_lab/ ./virality_lab/
COPY --chown=user:user config/ ./config/
COPY --chown=user:user .env.example ./.env

EXPOSE 7860

# Support dynamic PORT (Render/Koyeb uses $PORT, HuggingFace uses 7860)
CMD ["sh", "-c", "uvicorn virality_lab.api.app:app --host 0.0.0.0 --port ${PORT:-7860}"]
