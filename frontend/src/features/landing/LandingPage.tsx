import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLaunchStudio: (initialPrompt?: string, initialPlatform?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    hook: number;
    share: number;
    cohort: string;
    debates: { name: string; text: string }[];
  } | null>(null);

  // Flipped state for 5 persona cards
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorHudRef = useRef<HTMLDivElement>(null);
  const scrollFillRef = useRef<HTMLSpanElement>(null);
  const scrollValRef = useRef<HTMLSpanElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Synth Helper
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.08, gainVal = 0.05) => {
    if (!isAudioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const playGlitchNoise = () => {
    if (!isAudioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } catch (_) {}
  };

  const toggleAudio = () => {
    initAudio();
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    if (nextState) {
      setTimeout(() => playTone(880, 'triangle', 0.1, 0.08), 50);
    }
  };

  // Glitch Text Scramble
  const triggerScramble = (target: HTMLElement) => {
    if (!target || target.dataset.scrambling === 'true') return;
    const originalText = target.dataset.text || target.textContent || '';
    target.dataset.scrambling = 'true';
    const GLITCH_CHARS = '01010101#@$%&*<>~/[]_+=XZY!';
    let iteration = 0;
    const maxIterations = 14;

    const interval = setInterval(() => {
      target.textContent = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < (iteration / maxIterations) * originalText.length) {
            return originalText[index];
          }
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        })
        .join('');

      iteration++;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        target.textContent = originalText;
        target.dataset.scrambling = 'false';
      }
    }, 28);
  };

  // Cursor and Scroll Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      if (cursorHudRef.current) {
        const x = String(e.clientX).padStart(4, '0');
        const y = String(e.clientY).padStart(4, '0');
        cursorHudRef.current.textContent = `X:${x} Y:${y}`;
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

      if (scrollFillRef.current) {
        scrollFillRef.current.style.height = `${scrollPct}%`;
      }
      if (scrollValRef.current) {
        scrollValRef.current.textContent = `DEPTH: ${String(scrollPct).padStart(2, '0')}%`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll Reveal Intersection Observer
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-item, .reveal-card, .reveal-line, .persona-flip-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const scrambles = entry.target.querySelectorAll('.glitch-scramble');
            scrambles.forEach((el) => triggerScramble(el as HTMLElement));
            if (entry.target.classList.contains('glitch-scramble')) {
              triggerScramble(entry.target as HTMLElement);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Background Cyber Sparks Canvas
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.8 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(0, 255, 65, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00FF41';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 3D Wireframe Globe
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 48);
    const height = (canvas.height = 48);
    const cx = width / 2;
    const cy = height / 2;
    const radius = 20;
    let angle = 0;
    let animId: number;

    const drawGlobe = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.025;
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 1;

      // Outer boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Latitudinal rings
      for (let lat = -0.5; lat <= 0.5; lat += 0.5) {
        const rLat = radius * Math.cos(lat * Math.PI * 0.5);
        const yLat = cy + radius * Math.sin(lat * Math.PI * 0.5);
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudinal rotating meridian
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI) / 3;
        const xDist = Math.cos(a) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xDist), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawGlobe);
    };
    drawGlobe();

    return () => cancelAnimationFrame(animId);
  }, []);

  // Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let animId: number;

    const resizeWave = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 50;
      }
    };
    resizeWave();
    window.addEventListener('resize', resizeWave);

    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      ctx.strokeStyle = 'rgba(0, 255, 65, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < w; x += 4) {
        const noise = Math.sin(x * 0.05 + phase) * 8 + Math.cos(x * 0.02 - phase) * 4;
        const y = mid + noise * (Math.random() * 0.4 + 0.8);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (Math.random() < 0.2) {
        const spikeX = Math.random() * w;
        ctx.strokeStyle = '#00F0FF';
        ctx.beginPath();
        ctx.moveTo(spikeX, mid - 18);
        ctx.lineTo(spikeX, mid + 18);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawWave);
    };
    drawWave();

    return () => {
      window.removeEventListener('resize', resizeWave);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Persona card flip toggle
  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
    playTone(620, 'sine', 0.06, 0.04);
  };

  const handleRunQuickAudit = () => {
    const text = modalInput.trim() || 'Stop scrolling: 3 AI tools that will save you 10 hours a week.';
    setIsAuditing(true);
    playGlitchNoise();

    setTimeout(() => {
      setIsAuditing(false);
      const hasHook = /stop|why|how|secret|mistake|tools|save|hack/i.test(text);
      const hasCTA = /save|bookmark|thread|below|follow|share/i.test(text);

      let score = 72;
      if (hasHook) score += 12;
      if (hasCTA) score += 8;
      score = Math.min(96, Math.max(54, score));

      const hookPct = Math.min(99, score + 6);
      const sharePct = Math.max(48, score - 8);
      const topPct = Math.max(1, 100 - Math.round(score * 0.94 + 4));

      setAuditResult({
        score,
        hook: hookPct,
        share: sharePct,
        cohort: `TOP ${topPct}%`,
        debates: [
          {
            name: 'CASUAL SCROLLER [GEN-Z]',
            text: hasHook
              ? 'Opening hook stopped my thumb immediately. Good curiosity gap.'
              : 'Too generic opening, would scroll past within 1.2s without immediate punch.',
          },
          {
            name: 'SKEPTIC ANALYST',
            text: hasCTA
              ? 'Actionable takeaway is clear, but verify claims in comments before sharing.'
              : 'Lacks empirical proof points in first 3 seconds; high drop-off likelihood.',
          },
          {
            name: 'TREND HUNTER',
            text: 'High peer forwarding quotient. Will recommend save-and-share algorithm loop.',
          },
        ],
      });
      playTone(920, 'sine', 0.15, 0.08);
    }, 600);
  };

  const handleOpenStudioWithPrompt = (presetPrompt?: string) => {
    setIsModalOpen(false);
    onLaunchStudio(presetPrompt || modalInput, selectedPlatform);
  };

  return (
    <div className="landing-page-root">
      {/* CRT Screen Glitch & Scanline Overlay */}
      <div className="crt-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Floating Background Particle Canvas */}
      <canvas ref={bgCanvasRef} className="bg-particle-canvas" aria-hidden="true" />

      {/* Interactive Cursor HUD */}
      <div ref={cursorRef} className="cursor-crosshair" id="cursor">
        <div className="cursor-dot" />
        <div ref={cursorHudRef} className="cursor-hud" id="cursorHud">
          X:0000 Y:0000
        </div>
      </div>

      {/* Scroll Progress HUD */}
      <div className="scroll-hud-tracker" id="scrollHud">
        <span className="scroll-bar">
          <span ref={scrollFillRef} className="scroll-fill" id="scrollFill" />
        </span>
        <span ref={scrollValRef} className="scroll-val" id="scrollVal">
          DEPTH: 00%
        </span>
      </div>

      {/* Audio Toggle Floating Controller */}
      <button
        type="button"
        onClick={toggleAudio}
        className={`hud-audio-btn ${isAudioEnabled ? 'active' : ''}`}
        title="Toggle Terminal Audio Feedback"
      >
        <span className="audio-pulse" />
        <span>AUDIO: [{isAudioEnabled ? 'LIVE' : 'OFF'}]</span>
      </button>

      <div className="poster-container">
        {/* TOP HEADER */}
        <header className="poster-header reveal-item">
          <div className="header-left">
            <div
              className="tag-title glitch-scramble"
              data-text="// VIRALITY_LAB //"
              onMouseEnter={(e) => triggerScramble(e.currentTarget)}
            >
              // VIRALITY_LAB //
            </div>
            <div className="tag-sub">AI CONTENT INTELLIGENCE</div>
            <div className="tag-sub">MULTI-AGENT AUDIENCE ENGINE</div>
          </div>

          <nav className="header-nav">
            <a href="#personas" className="nav-link">
              [PERSONAS]
            </a>
            <a href="#engines" className="nav-link">
              [ENGINES]
            </a>
            <a href="#telemetry" className="nav-link">
              [TELEMETRY]
            </a>
            <button
              type="button"
              onClick={() => handleOpenStudioWithPrompt()}
              className="nav-link btn-terminal main-app-link cursor-pointer"
            >
              [⚡ LAUNCH STUDIO]
            </button>
          </nav>

          <div className="header-sys">
            <div className="corner-brackets">
              <div className="sys-diodes">
                <span className="diode green" />
                <span className="diode green pulse" />
              </div>
              <span className="sys-text">SYS_01 :: ONLINE</span>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-left reveal-item">
            <div className="distressed-headline-wrapper">
              <h1
                className="distressed-headline glitch-scramble"
                data-text="BREAK THE FEED."
                onMouseEnter={(e) => triggerScramble(e.currentTarget)}
              >
                BREAK
                <br />
                THE
                <br />
                FEED.
              </h1>
            </div>

            <div className="hero-subline-box">
              <div className="highlight-badge">SIMULATE WITHOUT GUESSWORK.</div>
              <div className="sub-motto">PREDICT WITHOUT LIMITS.</div>
              <div className="separator-line">_</div>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                onClick={() => handleOpenStudioWithPrompt()}
                className="cta-terminal-btn primary-pulse cursor-pointer"
              >
                <span className="btn-prefix">&gt;</span> LAUNCH VIRALITY LAB STUDIO_
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="cta-terminal-btn secondary cursor-pointer"
                id="heroAuditBtn"
              >
                <span className="btn-prefix">&gt;</span> QUICK SPECIMEN AUDIT_
              </button>
              <a href="#personas" className="cta-terminal-btn secondary">
                <span className="btn-prefix">&gt;</span> 5-AGENT AUDIENCE COUNCIL_
              </a>
            </div>
          </div>

          <div className="hero-right reveal-item delay-2">
            <div className="hero-avatar-frame">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>

              <div className="avatar-image-container">
                <img
                  src="/assets/hero_agent.png"
                  alt="Virality Lab Neural Persona Agent"
                  className="avatar-glitch-img"
                  id="heroAgentImg"
                />
                <div className="glitch-scanlines" />
                <div className="glitch-slice-bar" />
                <canvas ref={waveCanvasRef} className="agent-wave-canvas" />
              </div>

              <div className="hero-telemetry-pill">
                <div
                  className="pill-header glitch-scramble"
                  data-text="INTERFACE IS THE MESSAGE."
                  onMouseEnter={(e) => triggerScramble(e.currentTarget)}
                >
                  INTERFACE IS THE MESSAGE.
                </div>
                <div className="pill-footer">ATTENTION IS THE CURRENCY. — 2026_</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 PERSONA 3D FLIP CARDS */}
        <div className="section-tag-bar reveal-item" id="personas">
          <span
            className="section-tag glitch-scramble"
            data-text="_05_AUTONOMOUS_PERSONA_COUNCIL"
            onMouseEnter={(e) => triggerScramble(e.currentTarget)}
          >
            _05_AUTONOMOUS_PERSONA_COUNCIL
          </span>
          <span className="section-tag-line" />
          <span className="section-tag-meta">[FLIP CARDS TO DECRYPT DOSSIER ↻]</span>
        </div>

        <section className="personas-grid">
          {/* Persona 1 */}
          <div
            className={`persona-flip-card reveal-card delay-1 ${flippedCards['p1'] ? 'flipped' : ''}`}
            onClick={() => toggleFlip('p1')}
          >
            <div className="card-inner">
              <div className="card-face card-front">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="persona-portrait-box">
                  <img src="/assets/persona_01.png" alt="Casual Scroller" className="persona-dither-img" />
                  <div className="target-reticle red-reticle" />
                  <div className="scan-grid-overlay" />
                  <div className="biometric-tag">TARGET // 01 [LOCKED]</div>
                </div>
                <div className="persona-front-info">
                  <div className="persona-id-badge">AGENT_01 // GEN-Z</div>
                  <div className="persona-front-name">CASUAL SCROLLER</div>
                  <div className="persona-mini-stats">
                    <span className="p-stat">
                      ATTN: <strong>1.2s</strong>
                    </span>
                    <span className="p-stat">
                      SKEP: <strong>45%</strong>
                    </span>
                  </div>
                  <div className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</div>
                </div>
              </div>

              <div className="card-face card-back">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="dossier-header">
                  <span className="dossier-tag">DECLASSIFIED // AGENT_01</span>
                  <span className="dossier-status">● CRITICAL</span>
                </div>
                <div className="dossier-title">CASUAL SCROLLER</div>
                <div className="dossier-archetype">DOOMSCROLLING FEED HUNTER</div>
                <div className="dossier-traits">
                  <div className="d-trait">
                    <span className="dt-k">BIAS:</span> <span className="dt-v">Instant visual hooks</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">DROP:</span> <span className="dt-v text-red">Weak first 3 words</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">ALGO:</span> <span className="dt-v text-green">FYP Loop Retention</span>
                  </div>
                </div>
                <blockquote className="dossier-quote">
                  "If you don't hook me in the first sentence, I've already swiped to the next 3 clips."
                </blockquote>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudioWithPrompt(
                      'Stop scrolling if you are building in AI. Here is what 99% get wrong:'
                    );
                  }}
                  className="test-persona-btn cursor-pointer"
                >
                  ⚡ SIMULATE ON AGENT 01
                </button>
              </div>
            </div>
          </div>

          {/* Persona 2 */}
          <div
            className={`persona-flip-card reveal-card delay-2 ${flippedCards['p2'] ? 'flipped' : ''}`}
            onClick={() => toggleFlip('p2')}
          >
            <div className="card-inner">
              <div className="card-face card-front">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="persona-portrait-box">
                  <img src="/assets/persona_02.png" alt="Skeptic Analyst" className="persona-dither-img" />
                  <div className="target-reticle cyan-reticle" />
                  <div className="scan-grid-overlay" />
                  <div className="biometric-tag">TARGET // 02 [VERIFYING]</div>
                </div>
                <div className="persona-front-info">
                  <div className="persona-id-badge">AGENT_02 // AUDITOR</div>
                  <div className="persona-front-name">SKEPTIC ANALYST</div>
                  <div className="persona-mini-stats">
                    <span className="p-stat">
                      ATTN: <strong>2.8s</strong>
                    </span>
                    <span className="p-stat">
                      SKEP: <strong>90%</strong>
                    </span>
                  </div>
                  <div className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</div>
                </div>
              </div>

              <div className="card-face card-back">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="dossier-header">
                  <span className="dossier-tag">DECLASSIFIED // AGENT_02</span>
                  <span className="dossier-status">● VERIFIED</span>
                </div>
                <div className="dossier-title">SKEPTIC ANALYST</div>
                <div className="dossier-archetype">LOGIC & RIGOR AUDITOR</div>
                <div className="dossier-traits">
                  <div className="d-trait">
                    <span className="dt-k">BIAS:</span> <span className="dt-v">Methodology & receipts</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">DROP:</span> <span className="dt-v text-red">Clickbait exaggeration</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">ALGO:</span> <span className="dt-v text-green">Debate Reply Ratio</span>
                  </div>
                </div>
                <blockquote className="dossier-quote">
                  "Show me the reproducible data, not just emotional buzzwords and fake benchmarks."
                </blockquote>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudioWithPrompt(
                      'Why the latest benchmark numbers are technically misleading [Debate Thread 🧵]'
                    );
                  }}
                  className="test-persona-btn cursor-pointer"
                >
                  ⚡ SIMULATE ON AGENT 02
                </button>
              </div>
            </div>
          </div>

          {/* Persona 3 */}
          <div
            className={`persona-flip-card reveal-card delay-3 ${flippedCards['p3'] ? 'flipped' : ''}`}
            onClick={() => toggleFlip('p3')}
          >
            <div className="card-inner">
              <div className="card-face card-front">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="persona-portrait-box">
                  <img src="/assets/persona_03.png" alt="Trend Hunter" className="persona-dither-img" />
                  <div className="target-reticle yellow-reticle" />
                  <div className="scan-grid-overlay" />
                  <div className="biometric-tag">TARGET // 03 [CATALYZING]</div>
                </div>
                <div className="persona-front-info">
                  <div className="persona-id-badge">AGENT_03 // CREATOR</div>
                  <div className="persona-front-name">TREND HUNTER</div>
                  <div className="persona-mini-stats">
                    <span className="p-stat">
                      ATTN: <strong>1.8s</strong>
                    </span>
                    <span className="p-stat">
                      SKEP: <strong>35%</strong>
                    </span>
                  </div>
                  <div className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</div>
                </div>
              </div>

              <div className="card-face card-back">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="dossier-header">
                  <span className="dossier-tag">DECLASSIFIED // AGENT_03</span>
                  <span className="dossier-status">● VIRAL</span>
                </div>
                <div className="dossier-title">TREND HUNTER</div>
                <div className="dossier-archetype">MEME & FORMAT RADAR</div>
                <div className="dossier-traits">
                  <div className="d-trait">
                    <span className="dt-k">BIAS:</span> <span className="dt-v">Pacing & shareability</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">DROP:</span> <span className="dt-v text-red">Outdated templates</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">ALGO:</span> <span className="dt-v text-green">Peer Share Multiplier</span>
                  </div>
                </div>
                <blockquote className="dossier-quote">
                  "The hook structure is electric. I'm forwarding this directly to my creator group chats."
                </blockquote>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudioWithPrompt(
                      'The exact viral formula that drove 2.4M views in 48 hours (Save for later 📌)'
                    );
                  }}
                  className="test-persona-btn cursor-pointer"
                >
                  ⚡ SIMULATE ON AGENT 03
                </button>
              </div>
            </div>
          </div>

          {/* Persona 4 */}
          <div
            className={`persona-flip-card reveal-card delay-4 ${flippedCards['p4'] ? 'flipped' : ''}`}
            onClick={() => toggleFlip('p4')}
          >
            <div className="card-inner">
              <div className="card-face card-front">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="persona-portrait-box">
                  <img src="/assets/persona_04.png" alt="Fast Forwarder" className="persona-dither-img" />
                  <div className="target-reticle red-reticle" />
                  <div className="scan-grid-overlay" />
                  <div className="biometric-tag">TARGET // 04 [SPEED_2X]</div>
                </div>
                <div className="persona-front-info">
                  <div className="persona-id-badge">AGENT_04 // EXECUTIVE</div>
                  <div className="persona-front-name">FAST FORWARDER</div>
                  <div className="persona-mini-stats">
                    <span className="p-stat">
                      ATTN: <strong>1.0s</strong>
                    </span>
                    <span className="p-stat">
                      SKEP: <strong>75%</strong>
                    </span>
                  </div>
                  <div className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</div>
                </div>
              </div>

              <div className="card-face card-back">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="dossier-header">
                  <span className="dossier-tag">DECLASSIFIED // AGENT_04</span>
                  <span className="dossier-status">● HIGH_SPEED</span>
                </div>
                <div className="dossier-title">FAST FORWARDER</div>
                <div className="dossier-archetype">SIGNAL SCRUBBER</div>
                <div className="dossier-traits">
                  <div className="d-trait">
                    <span className="dt-k">BIAS:</span> <span className="dt-v">Bullet points & ROI</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">DROP:</span> <span className="dt-v text-red">Lengthy intros & fluff</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">ALGO:</span> <span className="dt-v text-green">Completion Velocity</span>
                  </div>
                </div>
                <blockquote className="dossier-quote">
                  "Skip the greeting and give me the 3 actionable takeaways immediately."
                </blockquote>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudioWithPrompt(
                      '3 AI tools that replaced 3 hours of daily work (bullet summary inside)'
                    );
                  }}
                  className="test-persona-btn cursor-pointer"
                >
                  ⚡ SIMULATE ON AGENT 04
                </button>
              </div>
            </div>
          </div>

          {/* Persona 5 */}
          <div
            className={`persona-flip-card reveal-card delay-5 ${flippedCards['p5'] ? 'flipped' : ''}`}
            onClick={() => toggleFlip('p5')}
          >
            <div className="card-inner">
              <div className="card-face card-front">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="persona-portrait-box">
                  <img src="/assets/persona_05.png" alt="Niche Expert" className="persona-dither-img" />
                  <div className="target-reticle green-reticle" />
                  <div className="scan-grid-overlay" />
                  <div className="biometric-tag">TARGET // 05 [ARCHIVING]</div>
                </div>
                <div className="persona-front-info">
                  <div className="persona-id-badge">AGENT_05 // AUTHORITY</div>
                  <div className="persona-front-name">NICHE EXPERT</div>
                  <div className="persona-mini-stats">
                    <span className="p-stat">
                      ATTN: <strong>3.5s</strong>
                    </span>
                    <span className="p-stat">
                      SKEP: <strong>85%</strong>
                    </span>
                  </div>
                  <div className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</div>
                </div>
              </div>

              <div className="card-face card-back">
                <div className="frame-corner top-left">┌</div>
                <div className="frame-corner top-right">┐</div>
                <div className="frame-corner bottom-left">└</div>
                <div className="frame-corner bottom-right">┘</div>
                <div className="dossier-header">
                  <span className="dossier-tag">DECLASSIFIED // AGENT_05</span>
                  <span className="dossier-status">● AUTHORITY</span>
                </div>
                <div className="dossier-title">NICHE EXPERT</div>
                <div className="dossier-archetype">DOMAIN ARCHIVIST</div>
                <div className="dossier-traits">
                  <div className="d-trait">
                    <span className="dt-k">BIAS:</span> <span className="dt-v">Deep domain insight</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">DROP:</span> <span className="dt-v text-red">Superficial listicles</span>
                  </div>
                  <div className="d-trait">
                    <span className="dt-k">ALGO:</span> <span className="dt-v text-green">Save & Bookmark Signal</span>
                  </div>
                </div>
                <blockquote className="dossier-quote">
                  "This is high-signal engineering documentation. Adding to my permanent bookmark archive."
                </blockquote>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudioWithPrompt(
                      'Deep dive: How multi-agent simulation architectures model human algorithmic contagion:'
                    );
                  }}
                  className="test-persona-btn cursor-pointer"
                >
                  ⚡ SIMULATE ON AGENT 05
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="section-tag-bar reveal-item" id="engines">
          <span
            className="section-tag glitch-scramble"
            data-text="_CORE INTELLIGENCE ENGINES"
            onMouseEnter={(e) => triggerScramble(e.currentTarget)}
          >
            _CORE INTELLIGENCE ENGINES
          </span>
          <span className="section-tag-line" />
        </div>

        {/* 4-CARD SELECTED ENGINES GRID */}
        <section className="engines-grid">
          <div className="engine-card reveal-card delay-1">
            <div className="card-media-box">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>
              <img src="/assets/card_01.png" alt="Doomscroller Hook Radar" className="card-img" />
              <div className="card-overlay-badge badge-white">DISRUPT</div>
            </div>
            <div className="card-info">
              <div
                className="card-title glitch-scramble"
                data-text="DOOMSCROLLER RADAR"
                onMouseEnter={(e) => triggerScramble(e.currentTarget)}
              >
                DOOMSCROLLER RADAR
              </div>
              <div className="card-meta">ATTENTION SPAN: 1.2S // 2026</div>
            </div>
          </div>

          <div className="engine-card reveal-card delay-2">
            <div className="card-media-box">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>
              <img src="/assets/card_02.png" alt="Neural Persona Council" className="card-img" />
              <div className="card-overlay-badge badge-green">NEURAL</div>
            </div>
            <div className="card-info">
              <div
                className="card-title glitch-scramble"
                data-text="PERSONA DEBATE STREAM"
                onMouseEnter={(e) => triggerScramble(e.currentTarget)}
              >
                PERSONA DEBATE STREAM
              </div>
              <div className="card-meta">SYNTHETIC CONSENSUS // COGNITIVE LAB</div>
            </div>
          </div>

          <div className="engine-card reveal-card delay-3">
            <div className="card-media-box">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>
              <img src="/assets/card_03.png" alt="5-Platform Matrix" className="card-img" />
              <div className="card-overlay-badge badge-white">MATRIX</div>
            </div>
            <div className="card-info">
              <div
                className="card-title glitch-scramble"
                data-text="5-CHANNEL ALGORITHM AUDIT"
                onMouseEnter={(e) => triggerScramble(e.currentTarget)}
              >
                5-CHANNEL ALGORITHM AUDIT
              </div>
              <div className="card-meta">TIKTOK · REELS · SHORTS · X · LINKEDIN</div>
            </div>
          </div>

          <div className="engine-card reveal-card delay-4">
            <div className="card-media-box">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>
              <img src="/assets/card_04.png" alt="Genetic Hook Mutator" className="card-img" />
              <div className="card-overlay-badge badge-green">GROWTH</div>
            </div>
            <div className="card-info">
              <div
                className="card-title glitch-scramble"
                data-text="GENETIC HOOK MUTATOR"
                onMouseEnter={(e) => triggerScramble(e.currentTarget)}
              >
                GENETIC HOOK MUTATOR
              </div>
              <div className="card-meta">CONTAGION OPTIMIZER // +28% LIFT</div>
            </div>
          </div>
        </section>

        {/* 3-COLUMN BOTTOM HUD & DRIPPING VIRAL EMBLEM */}
        <section className="spec-grid" id="telemetry">
          <div className="spec-col-info reveal-item delay-1">
            <div
              className="col-header glitch-scramble"
              data-text="// ENGINE_SPECS"
              onMouseEnter={(e) => triggerScramble(e.currentTarget)}
            >
              // ENGINE_SPECS
            </div>
            <ul className="spec-list">
              <li className="reveal-line delay-1">&gt; COGNITIVE HEURISTICS: 14 VECTORS</li>
              <li className="reveal-line delay-2">&gt; REAL-TIME AGENTS: 5 PERSONAS</li>
              <li className="reveal-line delay-3">&gt; MULTI-CHANNEL ADAPTATION:</li>
              <li className="sub-item reveal-line delay-4">_TIKTOK 2.8X FYP VELOCITY</li>
              <li className="sub-item reveal-line delay-5">_INSTAGRAM REELS EXPLORE</li>
              <li className="sub-item reveal-line delay-6">_YOUTUBE SHORTS 70%+ APV</li>
              <li className="sub-item reveal-line delay-7">_X / TWITTER DEBATE RATIO</li>
              <li className="sub-item reveal-line delay-8">_LINKEDIN 3-BULLET ROI</li>
            </ul>

            <div className="globe-container">
              <canvas ref={globeCanvasRef} className="wireframe-globe" />
              <div className="globe-caption">
                PREDICTING SOCIAL CONTAGION BEFORE YOU POST.
                <div className="globe-sub">_</div>
              </div>
            </div>
          </div>

          <div className="spec-col-motto reveal-item delay-2">
            <div className="motto-box-frame">
              <div className="frame-corner top-left">┌</div>
              <div className="frame-corner top-right">┐</div>
              <div className="frame-corner bottom-left">└</div>
              <div className="frame-corner bottom-right">┘</div>

              <div className="motto-text">
                I DON'T GUESS
                <br />
                ALGORITHMS.
                <br />
                <br />
                I ENGINEER
                <br />
                <span className="glitch-word" data-word="DISRUPTION.">
                  DISRUPTION.
                </span>
              </div>

              <div
                className="dripping-smiley-wrapper cursor-pointer"
                title="Click to trigger viral glitch burst"
                onClick={() => {
                  playGlitchNoise();
                  playTone(1200, 'sawtooth', 0.15, 0.1);
                }}
              >
                <svg className="dripping-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <g className="smiley-group" filter="url(#neon-glow)">
                    <path
                      d="M 20 45 A 30 30 0 1 1 80 45"
                      fill="none"
                      stroke="#00FF41"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 45 C 20 70, 30 85, 38 85 C 40 85, 41 108, 42 112 C 43 116, 46 116, 47 110 C 49 104, 50 85, 58 85 C 64 85, 66 102, 68 105 C 70 108, 72 108, 73 102 C 75 96, 78 70, 80 45"
                      fill="none"
                      stroke="#00FF41"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <line x1="33" y1="32" x2="43" y2="42" stroke="#00FF41" strokeWidth="4" strokeLinecap="round" />
                    <line x1="43" y1="32" x2="33" y2="42" stroke="#00FF41" strokeWidth="4" strokeLinecap="round" />
                    <line x1="57" y1="32" x2="67" y2="42" stroke="#00FF41" strokeWidth="4" strokeLinecap="round" />
                    <line x1="67" y1="32" x2="57" y2="42" stroke="#00FF41" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 32 58 Q 50 78 68 58" fill="none" stroke="#00FF41" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="43" cy="120" r="2.5" fill="#00FF41" className="drip-particle d1" />
                    <circle cx="69" cy="115" r="2" fill="#00FF41" className="drip-particle d2" />
                    <circle cx="28" cy="80" r="1.5" fill="#00FF41" className="drip-particle d3" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="spec-col-feed reveal-item delay-3">
            <div
              className="col-header glitch-scramble"
              data-text="// EXPERIMENTS_FEED"
              onMouseEnter={(e) => triggerScramble(e.currentTarget)}
            >
              // EXPERIMENTS_FEED
            </div>

            <div className="feed-log-list">
              <div className="feed-log-item reveal-card delay-1">
                <div className="log-thumb thumb-glitch-1" />
                <div className="log-info">
                  <div className="log-name">HOOK_ANALYSIS_01.LOG</div>
                  <div className="log-meta">98.4% RETENTION · 2.6 MB</div>
                </div>
              </div>

              <div className="feed-log-item reveal-card delay-2">
                <div className="log-thumb thumb-glitch-2" />
                <div className="log-info">
                  <div className="log-name">PERSONA_DEBATE.STREAM</div>
                  <div className="log-meta">1.4K REPLIES/SEC · 1.1 MB</div>
                </div>
              </div>

              <div className="feed-log-item reveal-card delay-3">
                <div className="log-thumb thumb-glitch-3" />
                <div className="log-info">
                  <div className="log-name">PAYOFF_VELOCITY.DAT</div>
                  <div className="log-meta">3.2X ALGO REACH · 3.7 MB</div>
                </div>
              </div>

              <div className="feed-log-item reveal-card delay-4">
                <div className="log-thumb thumb-glitch-4" />
                <div className="log-info">
                  <div className="log-name">GENETIC_OPTIMIZER.EXE</div>
                  <div className="log-meta">SCORE: 94/100 · 4.3 MB</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenStudioWithPrompt()}
              className="feed-more-link cursor-pointer text-left w-full border-none bg-transparent"
              id="viewAllLogsBtn"
            >
              &gt; VIEW LIVE STREAM IN STUDIO [PORT 5173]_
            </button>
          </div>
        </section>

        {/* GIANT BOTTOM STATEMENT */}
        <div className="giant-bottom-statement reveal-item">
          <h2
            className="statement-headline glitch-scramble"
            data-text="ATTENTION IS REBELLION."
            onMouseEnter={(e) => triggerScramble(e.currentTarget)}
          >
            ATTENTION IS REBELLION.
          </h2>
        </div>

        {/* FOOTER */}
        <footer className="poster-footer reveal-item">
          <div className="footer-left">
            <div className="footer-prompt">LET'S BREAK THE ALGORITHM TOGETHER.</div>
          </div>

          <div className="footer-center">
            <a href="mailto:contact@viralitylab.ai" className="footer-email">
              HELLO@VIRALITYLAB.AI
            </a>
          </div>

          <div className="footer-socials">
            <button
              type="button"
              onClick={() => handleOpenStudioWithPrompt()}
              className="footer-link cursor-pointer bg-transparent border-none"
            >
              [STUDIO]
            </button>
            <a
              href="https://github.com/waibhav-jha/virality-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              [GITHUB]
            </a>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="footer-link cursor-pointer bg-transparent border-none"
            >
              [QUICK AUDIT]
            </button>
          </div>

          <div className="footer-barcode-box">
            <div className="barcode-graphic" aria-label="Barcode VL_ENGINE_2026" />
            <div className="barcode-number">VL_ENGINE_2026</div>
          </div>
        </footer>
      </div>

      {/* INTERACTIVE SIMULATION MODAL TERMINAL */}
      {isModalOpen && (
        <div className="terminal-modal active">
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          <div className="modal-window">
            <div className="modal-header">
              <span className="modal-title">// VIRALITY LAB // LIVE SPECIMEN AUDITOR</span>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                [ESC / CLOSE]
              </button>
            </div>

            <div className="modal-body">
              <div className="terminal-prompt-line">
                <span className="prompt-arrow">&gt;</span> ENTER SPECIMEN HOOK OR CAPTION TO SIMULATE:
              </div>
              <textarea
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                className="terminal-textarea"
                placeholder="e.g. 3 AI tools that replaced 3 hours of daily work (save this) #productivity #ai"
              />

              <div className="terminal-platform-select">
                <span className="label">TARGET ALGORITHM:</span>
                {['tiktok', 'instagram', 'youtube', 'x', 'linkedin'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    className={`platform-chip ${selectedPlatform === p ? 'active' : ''}`}
                  >
                    {p === 'youtube' ? 'YOUTUBE SHORTS' : p.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  disabled={isAuditing}
                  onClick={handleRunQuickAudit}
                  className="terminal-execute-btn"
                >
                  {isAuditing ? '⚡ SYNTHESIZING AGENT COUNCIL...' : '⚡ RUN QUICK 5-AGENT AUDIT'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenStudioWithPrompt()}
                  className="terminal-redirect-btn cursor-pointer"
                >
                  🚀 OPEN IN FULL STUDIO APP &gt;&gt;
                </button>
              </div>

              {auditResult && (
                <div className="terminal-output-feed">
                  <div className="output-divider">--- AUDIENCE SIMULATION REPORT ---</div>
                  <div className="output-score-grid">
                    <div className="score-card">
                      <span className="sc-label">VIRALITY INDEX</span>
                      <span className="sc-val">{auditResult.score}/100</span>
                    </div>
                    <div className="score-card">
                      <span className="sc-label">HOOK VELOCITY</span>
                      <span className="sc-val">{auditResult.hook}%</span>
                    </div>
                    <div className="score-card">
                      <span className="sc-label">PEER FORWARDING</span>
                      <span className="sc-val">{auditResult.share}%</span>
                    </div>
                    <div className="score-card">
                      <span className="sc-label">COHORT RANK</span>
                      <span className="sc-val text-green">{auditResult.cohort}</span>
                    </div>
                  </div>
                  <div className="output-debates">
                    {auditResult.debates.map((d, i) => (
                      <div key={i} className="debate-bubble">
                        <span className="db-persona">&gt; {d.name}</span>
                        <span className="db-text">"{d.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
