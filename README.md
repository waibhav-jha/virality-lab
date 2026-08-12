# Virality Lab — AI-Powered Content Simulation & Optimization Engine

> **"Test and Optimize Before You Post."** — Virality Lab is a closed-loop simulation, virality scoring, and content optimization platform for digital creators and brands.

---

## 1. Core Intelligence Loop

```text
RAW CONTENT (Video / Image / Caption / Transcript)
     │
     ▼
CONTENT ANALYZER (Multimodal Text, Hook, Audio, Structure & Signal Extraction)
     │
     ▼
CONTENT PROFILE (Layer 1 Physical Observations + Layer 2 Intrinsic Signals)
     │
     ▼
AUDIENCE SIMULATION (Autonomous LLM Persona Agents: Gen-Z, Creator, Skeptic, etc.)
     │
     ▼
STRUCTURED REACTIONS (Stop-Scroll, Watch %, Share %, Save %, Dominant Emotions)
     │
     ▼
VIRALITY SCORING ENGINE (Calibrated Virality Potential Score + Friction Diagnostics)
     │
     ▼
CONTENT OPTIMIZATION ENGINE (Strategy Mapping, Targeted Variant Generation)
     │
     ▼
RE-SIMULATION & AUDIT (Regression Guardrails & Multi-Key Variant Selection)
     │
     ▼
BEST WINNING VARIANT + PERFORMANCE REPORT
```

---

## 2. API & Application Architecture

Virality Lab provides a unified REST API built on **FastAPI** and an orchestrator facade `ViralityLabEngine`:

```text
                               ┌─────────────────────────────┐
                               │       FastAPI Backend       │
                               │  (/health, /analyze, etc.)  │
                               └──────────────┬──────────────┘
                                              │
                               ┌──────────────▼──────────────┐
                               │      ViralityLabEngine      │
                               │    (Unified Top Facade)     │
                               └──────────────┬──────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         │                  │                 │                 │                  │
         ▼                  ▼                 ▼                 ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────┐
│ ContentAnalyzer │ │  Simulation   │ │ ViralityScore │ │ Optimization  │ │ Run & Media    │
│  (Multi-Modal)  │ │    Engine     │ │    Engine     │ │    Engine     │ │ Storage Store  │
└─────────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └────────────────┘
```

### API Endpoints:
- `GET  /health` — Health check, operational status, and active simulation mode (`mock` or `real`).
- `POST /api/upload` — Secure media asset upload (PNG, JPG, WEBP, MP4, MOV) with MIME and size validation.
- `POST /api/analyze` — Extract structural, hook, audio, and engagement features into `ContentProfile`.
- `POST /api/simulate` — Execute multi-agent persona simulation.
- `POST /api/score` — Compute virality score, segment agreement, and diagnostics.
- `POST /api/optimize` — Generate and simulate targeted candidate variants to select a winner.
- `POST /api/run` — Full end-to-end pipeline (synchronous or background async job with polling).
- `GET  /api/runs/{run_id}` — Poll background job stage progress, message, and final result payload.
- `GET  /api/runs` — List recent pipeline executions.

---

## 3. Quick Start

### 1. Run the FastAPI Server
```bash
python -m virality_lab serve --port 8000
```
Interactive OpenAPI documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Run the CLI
```bash
# Analyze content text
python -m virality_lab analyze "5 AI tools every student needs"

# Run end-to-end pipeline with optimization
python -m virality_lab run examples/sample_input.json --platform tiktok --objective overall
```

### 3. Run the Python API Client Demo
```bash
python examples/api_client_example.py
```

### 4. Run the Full Test Suite (116 Tests)
```bash
python -m pytest -v
```

---

## 4. Canonical Personas Panel

1. **Gen-Z Student** (18–24): High trend sensitivity (0.90), low attention span, fast pacing preference, high peer-to-peer share rate.
2. **Casual Scroller** (20–45): Extremely low attention span, passive viewer, highly sensitive to opening 2-3 seconds.
3. **Content Creator** (22–35): Evaluates storytelling loops, retention mechanics, video editing craft, and hook formulas.
4. **Skeptic** (25–45): Very low clickbait tolerance (0.10), detects exaggerated claims, demands immediate authenticity and proof.
5. **Niche Expert** (28–55): High domain knowledge, penalizes technical inaccuracies and clichés, evaluates genuine utility.

---

## 5. Configuration & Environment Variables

Create a `.env` file in the project root:

```env
# Simulation execution mode: 'mock' (offline deterministic) or 'real' / 'llm' (live LLM agents)
SIMULATION_MODE=mock

# Default LLM Provider: 'nvidia', 'openai', 'gemini', 'anthropic', 'ollama'
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=your_nvidia_api_key_here

# Temporary storage & Limits
MEDIA_STORAGE_DIR=.media_temp
MAX_UPLOAD_SIZE_MB=50
PIPELINE_TIMEOUT_SECONDS=120
```
