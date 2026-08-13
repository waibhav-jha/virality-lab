FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY virality_lab/ ./virality_lab/
COPY config/ ./config/
COPY .env.example ./.env

# Default environment configuration
ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1
ENV SIMULATION_MODE=mock

EXPOSE 8000

# Start FastAPI server
CMD ["sh", "-c", "uvicorn virality_lab.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
