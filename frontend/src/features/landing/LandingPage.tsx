import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './LandingPage.css';

interface LandingPageProps {
  onLaunchStudio: (presetPrompt?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  // Helper for GitHub Pages dynamic base path
  const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${cleanBase}${cleanPath}`;
  };

  // State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('Stop scrolling: 3 AI tools that will save you 10 hours a week.');
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [simResults, setSimResults] = useState<{
    score: number;
    hookPct: number;
    sharePct: number;
    topPct: number;
    debates: { name: string; text: string }[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [scrollDepth, setScrollDepth] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorHudRef = useRef<HTMLSpanElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  // =========================================================================
  // Hacker Text Scramble Engine
  // =========================================================================
  const GLITCH_CHARS = '01010101#@$%&*<>~/[]_+=XZY!';

  const triggerTextScramble = (el: HTMLElement) => {
    if (!el || el.dataset.scrambling === 'true') return;
    const originalText = el.dataset.text || el.textContent || '';
    if (!originalText.trim()) return;
    el.dataset.scrambling = 'true';
    let iteration = 0;
    const maxIterations = 14;

    const interval = window.setInterval(() => {
      el.textContent = originalText
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
        window.clearInterval(interval);
        el.textContent = originalText;
        el.dataset.scrambling = 'false';
      }
    }, 28);
  };

  // Sound Synth Functions
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.08, gainVal = 0.05) => {
    if (!audioEnabled || !audioCtxRef.current) return;
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
    } catch {
      // Audio fallback silent
    }
  };

  const playGlitchNoise = () => {
    if (!audioEnabled || !audioCtxRef.current) return;
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
    } catch {
      // Ignore audio error
    }
  };

  const toggleAudio = () => {
    initAudio();
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) {
      setTimeout(() => playTone(880, 'triangle', 0.1, 0.08), 50);
    }
  };

  // Cursor & Scroll Depth Tracking (Hardware-Accelerated Viewport Tracker)
  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;

    const updateCursorPosition = () => {
      if (cursorRef.current && mouseX >= 0) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (cursorHudRef.current && mouseX >= 0) {
        const x = String(Math.round(mouseX)).padStart(4, '0');
        const y = String(Math.round(mouseY)).padStart(4, '0');
        cursorHudRef.current.textContent = `X:${x} Y:${y}`;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateCursorPosition();
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      setScrollDepth(pct);
      updateCursorPosition();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Background Particles Canvas
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
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

  // 3D Wireframe Globe Canvas
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

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let lat = -0.5; lat <= 0.5; lat += 0.5) {
        const rLat = radius * Math.cos(lat * Math.PI * 0.5);
        const yLat = cy + radius * Math.sin(lat * Math.PI * 0.5);
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

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

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 50;
      }
    };
    resize();
    window.addEventListener('resize', resize);

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
        ctx.strokeStyle = '#D4FF00';
        ctx.beginPath();
        ctx.moveTo(spikeX, mid - 18);
        ctx.lineTo(spikeX, mid + 18);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawWave);
    };
    drawWave();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Scroll Reveals Observer & Glitch Scramble Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const scrambles = entry.target.querySelectorAll<HTMLElement>('.glitch-scramble');
            scrambles.forEach(triggerTextScramble);
            if (entry.target.classList.contains('glitch-scramble')) {
              triggerTextScramble(entry.target as HTMLElement);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const els = document.querySelectorAll('.reveal-item, .reveal-card, .reveal-line, .persona-flip-card');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Smooth Scroll Handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Card Flip Toggle
  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
    playTone(620, 'sine', 0.06, 0.04);
  };

  // Quick Simulation Handler
  const handleRunQuickSim = () => {
    setIsSimulating(true);
    playGlitchNoise();

    setTimeout(() => {
      setIsSimulating(false);
      const text = modalInput.trim();
      const hasHook = /stop|why|how|secret|mistake|tools|save|hack/i.test(text);
      const hasCTA = /save|bookmark|thread|below|follow|share/i.test(text);

      let score = 72;
      if (hasHook) score += 12;
      if (hasCTA) score += 8;
      score = Math.min(96, Math.max(54, score));

      setSimResults({
        score,
        hookPct: Math.min(99, score + 6),
        sharePct: Math.max(48, score - 8),
        topPct: Math.max(1, 100 - Math.round(score * 0.94 + 4)),
        debates: [
          {
            name: 'CASUAL SCROLLER [GEN-Z]',
            text: hasHook
              ? 'Opening hook stopped my thumb immediately. Good curiosity gap.'
              : 'Too generic opening, would scroll past within 1.2s without immediate visual punch.',
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
    }, 650);
  };

  // Persona Data for 5 Surveillance Flip Cards
  const personas = [
    {
      id: '01',
      name: 'CASUAL SCROLLER',
      code: 'GEN-Z',
      archetype: 'GEN-Z FEED HUNTER',
      attn: '1.2s',
      skep: '45%',
      img: 'assets/persona_01.png',
      reticleClass: 'target-reticle',
      tag: 'TARGET // 01 [LOCKED]',
      bias: 'Curiosity gap & speed',
      drop: 'Slow intros > 1.5s',
      algo: 'FYP Loop Retention',
      status: '● CRITICAL',
      statusColor: 'text-red',
      quote: '"If you don\'t shock or intrigue me in the first 1.2 seconds, my thumb is already gone."',
      preset: 'Stop scrolling: If you still create content this way in 2026, you are losing 80% reach.',
    },
    {
      id: '02',
      name: 'SKEPTIC ANALYST',
      code: 'LOGIC & RIGOR',
      archetype: 'LOGIC & RIGOR AUDITOR',
      attn: '2.8s',
      skep: '92%',
      img: 'assets/persona_02.png',
      reticleClass: 'target-reticle green-reticle',
      tag: 'TARGET // 02 [AUDITING]',
      bias: 'Methodology & receipts',
      drop: 'Clickbait exaggeration',
      algo: 'Debate Reply Ratio',
      status: '● VERIFIED',
      statusColor: 'text-green',
      quote: '"Show me the reproducible data, not just emotional buzzwords and fake benchmarks."',
      preset: 'We analyzed 14,200 viral short videos with multi-agent simulation. Here is what the algorithm actually measures.',
    },
    {
      id: '03',
      name: 'TREND HUNTER',
      code: 'CREATOR',
      archetype: 'MEME & FORMAT RADAR',
      attn: '1.8s',
      skep: '35%',
      img: 'assets/persona_03.png',
      reticleClass: 'target-reticle yellow-reticle',
      tag: 'TARGET // 03 [CATALYZING]',
      bias: 'Remixability & Audio',
      drop: 'Outdated memes',
      algo: 'Peer Share Multiplier',
      status: '● ACTIVE',
      statusColor: 'text-green',
      quote: '"I am always looking for formats I can replicate or share into my creator circle groupchat."',
      preset: 'This new AI workflow is replacing entire video editing pipelines. Save this before it goes mainstream.',
    },
    {
      id: '04',
      name: 'FAST FORWARDER',
      code: 'EXECUTIVE',
      archetype: 'SIGNAL SCRUBBER',
      attn: '1.0s',
      skep: '75%',
      img: 'assets/persona_04.png',
      reticleClass: 'target-reticle',
      tag: 'TARGET // 04 [SPEED_2X]',
      bias: 'Information density',
      drop: 'Corporate fluff',
      algo: 'Watch-Through %',
      status: '● HIGH VELOCITY',
      statusColor: 'text-red',
      quote: '"Get straight to the point. No 15-second intro greetings or fluff."',
      preset: '3 framework upgrades that increased our content retention from 24% to 78% in 14 days.',
    },
    {
      id: '05',
      name: 'NICHE EXPERT',
      code: 'AUTHORITY',
      archetype: 'DOMAIN ARCHIVIST',
      attn: '3.5s',
      skep: '85%',
      img: 'assets/persona_05.png',
      reticleClass: 'target-reticle green-reticle',
      tag: 'TARGET // 05 [ARCHIVING]',
      bias: 'Depth & originality',
      drop: 'Superficial lists',
      algo: 'Bookmark / Save Rate',
      status: '● PEER REVIEW',
      statusColor: 'text-green',
      quote: '"If this is high-signal domain insight, I will bookmark and cite it in my newsletter."',
      preset: 'Architectural deep-dive: How deterministic LLM consensus modeling predicts algorithmic distribution.',
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Portaled Global HUD & FX Layers mounted directly on document.body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Background Matrix Particles Canvas */}
            <canvas ref={bgCanvasRef} className="bg-particle-canvas" aria-hidden="true" />

            {/* CRT Scanline & Noise Shaders */}
            <div className="crt-overlay" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />

            {/* Custom Crosshair Cursor HUD */}
            <div ref={cursorRef} className="cursor-crosshair" aria-hidden="true">
              <div className="cursor-dot" />
              <span ref={cursorHudRef} className="cursor-hud">
                X:0000 Y:0000
              </span>
            </div>

            {/* Scroll Depth HUD Indicator */}
            <div className="scroll-hud-tracker" aria-hidden="true">
              <div className="scroll-bar">
                <div className="scroll-fill" style={{ height: `${scrollDepth}%` }} />
              </div>
              <span className="scroll-val">DEPTH: {String(scrollDepth).padStart(2, '0')}%</span>
            </div>

            {/* Floating Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`hud-audio-btn ${audioEnabled ? 'active' : ''}`}
              aria-label="Toggle Cyber Synth Audio"
            >
              <span className="audio-pulse" />
              <span>{audioEnabled ? 'AUDIO: [LIVE]' : 'AUDIO: [OFF]'}</span>
            </button>
          </>,
          document.body
        )}

      {/* Main Cyber Poster Container */}
      <div className="poster-container">
        {/* =================================================================
            HEADER
            ================================================================= */}
        <header className="poster-header reveal-item delay-1">
          <div className="header-left">
            <span
              className="tag-title glitch-scramble"
              data-text="VIRALITY LAB // PRE-FLIGHT SIMULATION LAB"
              onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
            >
              VIRALITY LAB // PRE-FLIGHT SIMULATION LAB
            </span>
            <span className="tag-sub">AESTHETIC ARCHIVE // POSTER 001 // AGENT COUNCIL MATRIX</span>
          </div>

          <nav className="header-nav">
            <a
              href="#council"
              onClick={(e) => handleSmoothScroll(e, 'council')}
              className="nav-link glitch-scramble"
              data-text="[COUNCIL]"
              onMouseEnter={(e) => {
                triggerTextScramble(e.currentTarget);
                playTone(500);
              }}
            >
              [COUNCIL]
            </a>
            <a
              href="#engines"
              onClick={(e) => handleSmoothScroll(e, 'engines')}
              className="nav-link glitch-scramble"
              data-text="[ENGINES]"
              onMouseEnter={(e) => {
                triggerTextScramble(e.currentTarget);
                playTone(550);
              }}
            >
              [ENGINES]
            </a>
            <a
              href="#specs"
              onClick={(e) => handleSmoothScroll(e, 'specs')}
              className="nav-link glitch-scramble"
              data-text="[SPECS]"
              onMouseEnter={(e) => {
                triggerTextScramble(e.currentTarget);
                playTone(600);
              }}
            >
              [SPECS]
            </a>
            <button
              onClick={() => onLaunchStudio()}
              className="nav-link btn-terminal main-app-link glitch-scramble"
              data-text="⚡ LAUNCH STUDIO"
              onMouseEnter={(e) => {
                triggerTextScramble(e.currentTarget);
                playTone(650);
              }}
            >
              ⚡ LAUNCH STUDIO
            </button>
          </nav>

          <div className="header-sys">
            <div className="corner-brackets">
              <div className="sys-diodes">
                <span className="diode pulse" />
                <span className="diode" />
                <span className="diode" />
              </div>
              <span className="sys-text">GRID: ACTIVE // 2026</span>
            </div>
          </div>
        </header>

        {/* =================================================================
            HERO SECTION
            ================================================================= */}
        <section className="hero-section">
          <div className="hero-left reveal-item delay-2">
            <div
              className="distressed-headline-wrapper"
              onClick={() => playGlitchNoise()}
              onMouseEnter={() => playTone(720)}
            >
              <h1 className="distressed-headline" data-text="VIRALITY LAB">
                VIRALITY
                <br />
                LAB
              </h1>
            </div>

            <div className="hero-subline-box">
              <div
                className="highlight-badge glitch-scramble"
                data-text="MULTI-AGENT PREDICTIVE SIMULATION"
                onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
              >
                MULTI-AGENT PREDICTIVE SIMULATION
              </div>
              <p className="sub-motto">
                AUTONOMOUS AUDIENCE INTELLIGENCE <span className="separator-line">/</span> PRE-PUBLICATION ALGORITHM AUDITOR
              </p>
            </div>

            <div className="hero-actions">
              <button
                onClick={() => onLaunchStudio()}
                className="cta-terminal-btn primary-pulse"
                onMouseEnter={() => playTone(800)}
              >
                <span className="btn-prefix">&gt;</span> ⚡ LAUNCH VIRALITY LAB STUDIO
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="cta-terminal-btn secondary"
                onMouseEnter={() => playTone(700)}
              >
                <span className="btn-prefix">&gt;</span> RUN QUICK SPECIMEN AUDIT
              </button>
            </div>
          </div>

          <div className="hero-right reveal-item delay-3">
            <div className="hero-avatar-frame">
              <span className="frame-corner top-left">┌</span>
              <span className="frame-corner top-right">┐</span>
              <span className="frame-corner bottom-left">└</span>
              <span className="frame-corner bottom-right">┘</span>

              <div className="avatar-image-container">
                <img
                  src={getAssetUrl('assets/hero_agent.png')}
                  alt="Agent Intelligence Portrait"
                  className="avatar-glitch-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getAssetUrl('assets/hero_portrait.png');
                  }}
                />
                <div className="glitch-scanlines" />
                <div className="glitch-slice-bar" />
                <canvas ref={waveCanvasRef} className="agent-wave-canvas" />
              </div>

              <div className="hero-telemetry-pill">
                <span className="pill-header">SPECIMEN // 00-AGENT-ALPHA</span>
                <span className="pill-footer">STATUS: SYNTHESIZING // 99.4% CONFIDENCE</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            5 PERSONA 3D FLIP CARD SURVEILLANCE MATRIX
            ================================================================= */}
        <div id="council" className="section-tag-bar reveal-line delay-3">
          <span
            className="section-tag glitch-scramble"
            data-text="_05_AUTONOMOUS_PERSONA_COUNCIL"
            onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
          >
            _05_AUTONOMOUS_PERSONA_COUNCIL
          </span>
          <div className="section-tag-line" />
          <span className="section-tag-meta">[FLIP CARDS TO DECRYPT DOSSIER ↻]</span>
        </div>

        <section className="personas-grid" aria-label="5 Autonomous Persona Council">
          {personas.map((p, idx) => (
            <div
              key={p.id}
              className={`persona-flip-card reveal-card delay-${idx + 2} ${
                flippedCards[idx] ? 'flipped' : ''
              }`}
              onClick={() => toggleFlip(idx)}
              onMouseEnter={() => playTone(460 + idx * 60)}
            >
              <div className="card-inner">
                {/* Front Face: Surveillance Dither Portrait */}
                <div className="card-face card-front">
                  <div className="persona-portrait-box">
                    <img
                      src={getAssetUrl(p.img)}
                      alt={p.name}
                      className="persona-dither-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getAssetUrl(`assets/card_0${(idx % 4) + 1}.png`);
                      }}
                    />
                    <div className={p.reticleClass} />
                    <div className="scan-grid-overlay" />
                    <span className="biometric-tag">{p.tag}</span>
                  </div>

                  <div className="persona-front-info">
                    <span className="persona-id-badge">
                      AGENT_{p.id} // {p.code}
                    </span>
                    <span
                      className="persona-front-name glitch-scramble"
                      data-text={p.name}
                      onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
                    >
                      {p.name}
                    </span>
                    <div className="persona-mini-stats">
                      <span>
                        ATTN: <strong>{p.attn}</strong>
                      </span>
                      <span>
                        SKEP: <strong>{p.skep}</strong>
                      </span>
                    </div>
                    <span className="flip-prompt">↻ CLICK / HOVER TO DECRYPT</span>
                  </div>
                </div>

                {/* Back Face: Declassified Dossier */}
                <div className="card-face card-back">
                  <div className="dossier-header">
                    <span className="dossier-tag">DECLASSIFIED // AGENT_{p.id}</span>
                    <span className={`dossier-status ${p.statusColor}`}>{p.status}</span>
                  </div>

                  <div className="dossier-title">{p.name}</div>
                  <div className="dossier-archetype">{p.archetype}</div>

                  <div className="dossier-traits">
                    <div className="d-trait">
                      <span className="dt-k">BIAS:</span>
                      <span className="dt-v">{p.bias}</span>
                    </div>
                    <div className="d-trait">
                      <span className="dt-k">DROP:</span>
                      <span className="dt-v text-red">{p.drop}</span>
                    </div>
                    <div className="d-trait">
                      <span className="dt-k">ALGO:</span>
                      <span className="dt-v text-green">{p.algo}</span>
                    </div>
                  </div>

                  <p className="dossier-quote">{p.quote}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchStudio(p.preset);
                    }}
                    className="test-persona-btn"
                  >
                    ⚡ SIMULATE ON AGENT {p.id}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* =================================================================
            4 CORE INTELLIGENCE ENGINES GRID
            ================================================================= */}
        <div id="engines" className="section-tag-bar reveal-line delay-4">
          <span
            className="section-tag glitch-scramble"
            data-text="_CORE INTELLIGENCE ENGINES"
            onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
          >
            _CORE INTELLIGENCE ENGINES
          </span>
          <div className="section-tag-line" />
        </div>

        <section className="engines-grid">
          <div
            className="engine-card reveal-card delay-3"
            onClick={() => onLaunchStudio()}
            onMouseEnter={() => playTone(540)}
          >
            <div className="card-media-box">
              <img
                src={getAssetUrl('assets/card_01.png')}
                alt="Doomscroller Radar"
                className="card-img"
              />
              <span className="card-overlay-badge badge-white">DISRUPT</span>
            </div>
            <div className="card-info">
              <span
                className="card-title glitch-scramble"
                data-text="DOOMSCROLLER RADAR"
                onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
              >
                DOOMSCROLLER RADAR
              </span>
              <span className="card-meta">ATTENTION SPAN: 1.2S // 2026</span>
            </div>
          </div>

          <div
            className="engine-card reveal-card delay-4"
            onClick={() => onLaunchStudio()}
            onMouseEnter={() => playTone(600)}
          >
            <div className="card-media-box">
              <img
                src={getAssetUrl('assets/card_02.png')}
                alt="Persona Debate Stream"
                className="card-img"
              />
              <span className="card-overlay-badge badge-green">NEURAL</span>
            </div>
            <div className="card-info">
              <span
                className="card-title glitch-scramble"
                data-text="PERSONA DEBATE STREAM"
                onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
              >
                PERSONA DEBATE STREAM
              </span>
              <span className="card-meta">SYNTHETIC CONSENSUS // COGNITIVE LAB</span>
            </div>
          </div>

          <div
            className="engine-card reveal-card delay-5"
            onClick={() => onLaunchStudio()}
            onMouseEnter={() => playTone(660)}
          >
            <div className="card-media-box">
              <img
                src={getAssetUrl('assets/card_03.png')}
                alt="5-Channel Algorithm Audit"
                className="card-img"
              />
              <span className="card-overlay-badge badge-white">MATRIX</span>
            </div>
            <div className="card-info">
              <span
                className="card-title glitch-scramble"
                data-text="5-CHANNEL ALGORITHM AUDIT"
                onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
              >
                5-CHANNEL ALGORITHM AUDIT
              </span>
              <span className="card-meta">TIKTOK · REELS · SHORTS · X · LINKEDIN</span>
            </div>
          </div>

          <div
            className="engine-card reveal-card delay-6"
            onClick={() => onLaunchStudio()}
            onMouseEnter={() => playTone(720)}
          >
            <div className="card-media-box">
              <img
                src={getAssetUrl('assets/card_04.png')}
                alt="Genetic Hook Mutator"
                className="card-img"
              />
              <span className="card-overlay-badge badge-green">GROWTH</span>
            </div>
            <div className="card-info">
              <span
                className="card-title glitch-scramble"
                data-text="GENETIC HOOK MUTATOR"
                onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
              >
                GENETIC HOOK MUTATOR
              </span>
              <span className="card-meta">CONTAGION OPTIMIZER // +28% LIFT</span>
            </div>
          </div>
        </section>

        {/* =================================================================
            3-COLUMN SPECS & ANTHEM
            ================================================================= */}
        <section id="specs" className="spec-grid reveal-item delay-5">
          <div className="spec-col-info">
            <div
              className="col-header glitch-scramble"
              data-text="_SYSTEM MATRIX SPECIFICATIONS"
              onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
            >
              _SYSTEM MATRIX SPECIFICATIONS
            </div>
            <ul className="spec-list">
              <li>01 / MULTI-AGENT DELIBERATION</li>
              <li className="sub-item">→ 5 Deterministic Personas</li>
              <li className="sub-item">→ Synthetic Consensus Engine</li>
              <li>02 / CROSS-PLATFORM WEIGHTS</li>
              <li className="sub-item">→ TikTok FYP Engine v8</li>
              <li className="sub-item">→ Instagram Graph 2026</li>
              <li className="sub-item">→ YouTube Shorts Retention</li>
              <li className="sub-item">→ X Viral Virality Multiplier</li>
              <li className="sub-item">→ LinkedIn High-Signal Audit</li>
            </ul>

            <div className="globe-container">
              <canvas ref={globeCanvasRef} className="wireframe-globe" />
              <p className="globe-caption">
                DISTRIBUTED SIMULATION NETWORK
                <br />
                <span className="globe-sub">SYNTHESIZED IN REAL-TIME</span>
              </p>
            </div>
          </div>

          <div className="spec-col-motto">
            <div className="motto-box-frame">
              <p className="motto-text">
                "NEVER PUBLISH INTO THE VOID. <span className="glitch-word">SIMULATE FIRST</span>,
                DOMINATE THE FEED."
              </p>

              <div
                className="dripping-smiley-wrapper"
                onClick={() => playGlitchNoise()}
                title="Click to Trigger Viral Glitch"
              >
                <svg className="dripping-svg" viewBox="0 0 100 120">
                  <circle cx="50" cy="45" r="38" fill="none" stroke="#00FF41" strokeWidth="3" />
                  <ellipse cx="38" cy="38" rx="4" ry="7" fill="#00FF41" />
                  <ellipse cx="62" cy="38" rx="4" ry="7" fill="#00FF41" />
                  <path
                    d="M 32 55 Q 50 75 68 55"
                    fill="none"
                    stroke="#00FF41"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 30 78 C 30 92 34 98 34 108"
                    fill="none"
                    stroke="#00FF41"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50 83 C 50 98 52 104 52 118"
                    fill="none"
                    stroke="#00FF41"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 70 78 C 70 90 68 96 68 106"
                    fill="none"
                    stroke="#00FF41"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="34" cy="114" r="2.5" fill="#00FF41" className="drip-particle d1" />
                  <circle cx="52" cy="122" r="3" fill="#00FF41" className="drip-particle d2" />
                  <circle cx="68" cy="112" r="2" fill="#00FF41" className="drip-particle d3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="spec-col-feed">
            <div
              className="col-header glitch-scramble"
              data-text="_ACTIVE SPECIMEN LOGS"
              onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
            >
              _ACTIVE SPECIMEN LOGS
            </div>
            <div className="feed-log-list">
              <div
                className="feed-log-item"
                onClick={() => onLaunchStudio('AI Engineering 10h/Week Fix')}
              >
                <div className="log-thumb thumb-glitch-1" />
                <div className="log-info">
                  <span className="log-name">AI Engineering 10h/Week</span>
                  <span className="log-meta">TIKTOK // SCORE: 88 // RETENTION: 92%</span>
                </div>
              </div>

              <div
                className="feed-log-item"
                onClick={() => onLaunchStudio('Biomechanical Pushup Fix')}
              >
                <div className="log-thumb thumb-glitch-2" />
                <div className="log-info">
                  <span className="log-name">Biomechanical Pushup Fix</span>
                  <span className="log-meta">INSTAGRAM // SCORE: 84 // SHARES: 89%</span>
                </div>
              </div>

              <div
                className="feed-log-item"
                onClick={() => onLaunchStudio('SaaS Simulation Framework')}
              >
                <div className="log-thumb thumb-glitch-3" />
                <div className="log-info">
                  <span className="log-name">SaaS Simulation Framework</span>
                  <span className="log-meta">X / TWITTER // SCORE: 91 // REPOSTS: 95%</span>
                </div>
              </div>

              <div
                className="feed-log-item"
                onClick={() => onLaunchStudio('Genetic Mutator Optimization Winner')}
              >
                <div className="log-thumb thumb-glitch-4" />
                <div className="log-info">
                  <span className="log-name">Genetic Mutator Winner</span>
                  <span className="log-meta">LINKEDIN // SCORE: 94 // LIFT: +32%</span>
                </div>
              </div>
            </div>

            <button onClick={() => onLaunchStudio()} className="feed-more-link">
              [+ EXECUTE FULL SIMULATION STUDIO →]
            </button>
          </div>
        </section>

        {/* =================================================================
            GIANT BOTTOM STATEMENT
            ================================================================= */}
        <section className="giant-bottom-statement reveal-item delay-6">
          <h2
            className="statement-headline glitch-scramble"
            data-text="SIMULATE BEFORE BROADCAST"
            onMouseEnter={(e) => triggerTextScramble(e.currentTarget)}
          >
            SIMULATE BEFORE BROADCAST
          </h2>
        </section>

        {/* =================================================================
            POSTER FOOTER
            ================================================================= */}
        <footer className="poster-footer reveal-item delay-7">
          <div className="footer-left">VIRALITY LAB // AESTHETIC INSTRUMENTS</div>

          <div className="footer-center">
            <span className="footer-meta-tag">AUTONOMOUS AUDIENCE SIMULATION SUITE</span>
          </div>

          <div className="footer-socials">
            <a
              href="https://github.com/waibhav-jha/virality-lab"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              [GITHUB]
            </a>
            <button onClick={() => onLaunchStudio()} className="footer-link">
              [STUDIO]
            </button>
          </div>

          <div className="footer-barcode-box">
            <div className="barcode-graphic" />
            <span className="barcode-number">2026-VIRALITY-LAB-V0.9</span>
          </div>
        </footer>
      </div>

      {/* =================================================================
          QUICK SPECIMEN SIMULATION TERMINAL MODAL
          ================================================================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className={`terminal-modal ${isModalOpen ? 'active' : ''}`}>
            <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
            <div className="modal-window">
              <div className="modal-header">
                <span className="modal-title">⚡ VIRALITY LAB // QUICK SPECIMEN AUDITOR</span>
                <button onClick={() => setIsModalOpen(false)} className="modal-close">
                  [ESC / CLOSE ✕]
                </button>
              </div>

              <div className="modal-body">
                <div className="terminal-prompt-line">
                  <span className="prompt-arrow">&gt;</span> ENTER SPECIMEN HOOK OR SCRIPT:
                </div>

                <textarea
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  className="terminal-textarea"
                  placeholder="Type or paste your hook, script, or tweet..."
                />

                <div className="terminal-platform-select">
                  <span className="label">TARGET ALGORITHM:</span>
                  {['tiktok', 'instagram', 'youtube', 'x', 'linkedin'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`platform-chip ${selectedPlatform === plat ? 'active' : ''}`}
                    >
                      {plat.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="modal-actions-row">
                  <button
                    onClick={handleRunQuickSim}
                    disabled={isSimulating}
                    className="terminal-execute-btn"
                  >
                    {isSimulating ? '⚡ SYNTHESIZING AGENT COUNCIL...' : '⚡ RUN QUICK 5-AGENT AUDIT'}
                  </button>

                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onLaunchStudio(modalInput);
                    }}
                    className="terminal-redirect-btn"
                  >
                    ⚡ OPEN IN STUDIO →
                  </button>
                </div>

                {simResults && (
                  <div className="terminal-output-feed">
                    <div className="output-divider">
                      ━━━━━━━━━ AUDIT TELEMETRY RESULTS ━━━━━━━━━
                    </div>

                    <div className="output-score-grid">
                      <div className="score-card">
                        <span className="sc-label">VIRALITY SCORE</span>
                        <span className="sc-val text-green">{simResults.score}/100</span>
                      </div>
                      <div className="score-card">
                        <span className="sc-label">0-3s RETENTION</span>
                        <span className="sc-val">{simResults.hookPct}%</span>
                      </div>
                      <div className="score-card">
                        <span className="sc-label">SHARE MULTIPLIER</span>
                        <span className="sc-val">{simResults.sharePct}%</span>
                      </div>
                      <div className="score-card">
                        <span className="sc-label">BENCHMARK TIER</span>
                        <span className="sc-val text-green">TOP {simResults.topPct}%</span>
                      </div>
                    </div>

                    <div className="output-debates">
                      {simResults.debates.map((d, i) => (
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
          </div>,
          document.body
        )}
    </div>
  );
};
