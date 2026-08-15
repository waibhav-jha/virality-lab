# Virality Lab — AI-Powered Content Simulation & Optimization Engine

> **"Test and Optimize Before You Post."** — Virality Lab is a closed-loop audience simulation, virality potential scoring, and AI content optimization platform for digital creators, growth marketers, and brands.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-125%20Passing-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](tests/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)

---

## ⚡ Core Features & Capabilities

- 🤖 **Multi-Agent Audience Simulation**: Simulates diverse viewer archetypes (Gen-Z Student, Casual Scroller, Content Creator, Skeptic, Niche Expert) using LLMs (NVIDIA NIM, OpenAI, Gemini, Claude, Ollama) or deterministic heuristic mock agents.
- 📊 **Calibrated Virality Potential Score (0–100)**: Multi-dimensional platform-weighted scoring combining Retention, Sharing velocity, Engagement, and Follower Conversion probabilities.
- 🎯 **Algorithmic Friction Diagnostics**: Identifies drop-off bottlenecks in the first 3 seconds (hooks), pacing drop-offs, low emotional resonance, or missing Calls to Action (CTAs).
- 🔄 **Autonomous Content Optimizer**: Maps identified diagnostics to strategic refinement recipes (Hook Sharpening, Story Pacing, CTA Enhancement, Shareability Triggers) and generates competing variants.
- ⚔️ **A/B Testing Arena & Persona Debate Stream**: Simulates head-to-head variant matches and displays real-time simulated commentary and discourse between personas.
- 🌐 **Cross-Platform Performance Matrix**: Compares projected performance across TikTok, Instagram Reels, YouTube Shorts, X / Twitter, and LinkedIn.
- ⚡ **Dual-Engine Architecture**: Seamlessly execute against the **FastAPI Python Backend** with live LLMs or run completely client-side via the **In-Browser TypeScript Simulator** (enabling zero-backend static deployments like GitHub Pages).

---

## 1. Core Intelligence Loop

```text
RAW CONTENT (Video / Image / Caption / Transcript)
     │
     ▼
CONTENT ANALYZER (Multimodal Text, Hook, Audio, Structure & Signal Extraction)
     │
     ▼
CONTENT PROFILE (Physical Observations + Intrinsic Engagement Signals)
     │
     ▼
AUDIENCE SIMULATION (Autonomous Persona Agents: Gen-Z, Creator, Skeptic, etc.)
     │
     ▼
STRUCTURED REACTIONS (Stop-Scroll %, Watch %, Share %, Save %, Dominant Emotions)
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
BEST WINNING VARIANT + EXPLAINABLE PERFORMANCE REPORT
```

---

## 2. Architecture & Components

```text
                               ┌─────────────────────────────┐
                               │   Cyberpunk React Studio    │
                               │  (Vite + TS + Tailwind CSS) │
                               └──────────────┬──────────────┘
                                              │ HTTP / JSON
                               ┌──────────────▼──────────────┐
                               │       FastAPI Backend       │
                               │  (/health, /api/run, etc.)  │
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
                            │                                   │
                            ▼                                   ▼
                   ┌─────────────────┐                 ┌─────────────────┐
                   │  LLM Providers  │                 │ Optimization    │
                   │ (NVIDIA, Gemini,│                 │ Strategies &    │
                   │ OpenAI, Claude, │                 │ Variant Ranking │
                   │ Ollama, Mock)   │                 └─────────────────┘
                   └─────────────────┘
```

---

## 3. Quick Start Guide

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+ (for frontend)

---

### Step 1: Clone and Set Up Python Backend

```bash
# Clone the repository
git clone https://github.com/waibhav-jha/virality-lab.git
cd virality-lab

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 2: Start the FastAPI Backend Server

```bash
# Start backend on http://127.0.0.1:8000
python -m virality_lab serve --port 8000
```
Interactive OpenAPI documentation will be accessible at `http://127.0.0.1:8000/docs`.

---

### Step 3: Start the Interactive Web Studio (Frontend)

In a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173/`** in your browser to launch the Cyberpunk Simulation Studio.

---

### Step 4: Run the CLI Directly

You can also run analysis and simulations directly from the command line:

```bash
# 1. Analyze content text and extract hooks
python -m virality_lab analyze "5 AI tools that will save you 10 hours a week"

# 2. Run end-to-end simulation & optimization pipeline on an input file
python -m virality_lab run examples/sample_input.json --platform tiktok --objective overall

# 3. Run the Python API Client Demo
python examples/api_client_example.py
```

---

### Step 5: Run the Full Test Suite (125 Tests)

```bash
python -m pytest -v
```

---

## 4. Canonical Persona Panel

The simulation engine evaluates content against a diverse panel of autonomous agents:

| Persona | Age Bracket | Attention Span | Trend Sensitivity | Clickbait Tolerance | Key Behavioral Traits |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gen-Z Student** | 18–24 | Low (1–2s) | Very High (0.90) | Medium (0.50) | Fast pacing preference, high peer-to-peer share rate, meme-literate. |
| **Casual Scroller** | 20–45 | Extremely Low | Medium (0.50) | Medium (0.50) | Passive viewer, ruthless on first 3 seconds, easily skips slow intros. |
| **Content Creator** | 22–35 | High | High (0.80) | High (0.75) | Evaluates storytelling loops, retention mechanics, and hook formulas. |
| **Skeptic** | 25–45 | Medium | Low (0.25) | Very Low (0.10) | Detects exaggerated claims, demands immediate authenticity and proof. |
| **Niche Expert** | 28–55 | High | Medium (0.40) | Low (0.20) | High domain knowledge, penalizes technical inaccuracies and clichés. |

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check, operational status, and active simulation mode (`mock` or `real`). |
| `POST` | `/api/upload` | Secure media asset upload (PNG, JPG, WEBP, MP4, MOV) with MIME and size validation. |
| `POST` | `/api/analyze` | Extract structural, hook, audio, and engagement features into `ContentProfile`. |
| `POST` | `/api/simulate` | Execute multi-agent persona simulation across selected persona agents. |
| `POST` | `/api/score` | Compute virality potential score, segment agreement, and diagnostics. |
| `POST` | `/api/optimize` | Generate targeted candidate variants and select the winning refinement. |
| `POST` | `/api/run` | Full end-to-end pipeline (synchronous or background async job with polling). |
| `GET` | `/api/runs/{run_id}` | Poll background job stage progress, status messages, and final results. |
| `GET` | `/api/runs` | List recent pipeline executions. |

---

## 6. Environment Configuration

Create a `.env` file in the project root (see [`.env.example`](.env.example)):

```env
# Simulation execution mode: 'mock' (offline deterministic) or 'real' / 'llm' (live LLM agents)
SIMULATION_MODE=mock

# Default LLM Provider: 'nvidia', 'openai', 'gemini', 'anthropic', 'ollama'
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=your_nvidia_api_key_here

# Optional API Keys for other providers:
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OLLAMA_BASE_URL=http://localhost:11434

# Temporary storage & Limits
MEDIA_STORAGE_DIR=.media_temp
MAX_UPLOAD_SIZE_MB=50
PIPELINE_TIMEOUT_SECONDS=120
```

---

## 7. Docker Deployment

Build and run Virality Lab as a self-contained container:

```bash
# Build the Docker image
docker build -t virality-lab .

# Run the container
docker run -p 8000:8000 --env-file .env virality-lab
```

---

## 8. Tech Stack Summary

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, PyYAML, Uvicorn, Gunicorn, Pytest
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **LLM Integrations**: NVIDIA NIM API, Google Gemini, OpenAI, Anthropic Claude, Ollama, Deterministic Mock
- **CI/CD**: GitHub Actions (GitHub Pages automated deployment)

---

## 9. License

This project is licensed under the MIT License — see the `LICENSE` file for details.
