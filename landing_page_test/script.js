/**
 * VIRALITY LAB // CYBER-BRUTALIST INTERACTIVE CLIENT SCRIPT
 * Enhanced with Scroll Reveals, 3D Flip Card Personas, Glitch Scramble & Audio
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Custom Interactive Cursor HUD Tracker
  // =========================================================================
  const cursor = document.getElementById('cursor');
  const cursorHud = document.getElementById('cursorHud');

  window.addEventListener('mousemove', (e) => {
    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
    if (cursorHud) {
      const x = String(e.clientX).padStart(4, '0');
      const y = String(e.clientY).padStart(4, '0');
      cursorHud.textContent = `X:${x} Y:${y}`;
    }
  });

  // =========================================================================
  // 2. Scroll Depth Tracker HUD
  // =========================================================================
  const scrollFill = document.getElementById('scrollFill');
  const scrollVal = document.getElementById('scrollVal');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

    if (scrollFill) {
      scrollFill.style.height = `${scrollPct}%`;
    }
    if (scrollVal) {
      scrollVal.textContent = `DEPTH: ${String(scrollPct).padStart(2, '0')}%`;
    }
  });

  // =========================================================================
  // 3. Scroll Reveal & Intersection Observer
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-item, .reveal-card, .reveal-line, .persona-flip-card');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Trigger glitch text scramble on reveal
        const scrambles = entry.target.querySelectorAll('.glitch-scramble');
        scrambles.forEach(triggerTextScramble);
        if (entry.target.classList.contains('glitch-scramble')) {
          triggerTextScramble(entry.target);
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealObserver.observe(el));

  // =========================================================================
  // 4. Glitch Text Scramble Engine
  // =========================================================================
  const GLITCH_CHARS = '01010101#@$%&*<>~/[]_+=XZY!';

  function triggerTextScramble(el) {
    if (!el || el.dataset.scrambling === 'true') return;
    const originalText = el.dataset.text || el.textContent;
    el.dataset.scrambling = 'true';
    let iteration = 0;
    const maxIterations = 14;

    const interval = setInterval(() => {
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
        clearInterval(interval);
        el.textContent = originalText;
        el.dataset.scrambling = 'false';
      }
    }, 28);
  }

  document.querySelectorAll('.glitch-scramble').forEach((el) => {
    el.addEventListener('mouseenter', () => triggerTextScramble(el));
  });

  // =========================================================================
  // 5. Floating Background Cyber Sparks Canvas
  // =========================================================================
  const bgCanvas = document.getElementById('bgParticleCanvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.8 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    function renderParticles() {
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

      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // =========================================================================
  // 6. Web Audio API Cyber Synth Feedback
  // =========================================================================
  let audioCtx = null;
  let isAudioEnabled = false;
  const audioToggle = document.getElementById('audioToggle');
  const audioLabel = document.getElementById('audioLabel');

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!isAudioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn('Audio play error', err);
    }
  }

  function playGlitchNoise() {
    if (!isAudioEnabled || !audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.05;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      whiteNoise.start();
    } catch (e) {}
  }

  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      initAudio();
      isAudioEnabled = !isAudioEnabled;
      if (isAudioEnabled) {
        audioToggle.classList.add('active');
        audioLabel.textContent = 'AUDIO: [LIVE]';
        playTone(880, 'triangle', 0.1, 0.08);
      } else {
        audioToggle.classList.remove('active');
        audioLabel.textContent = 'AUDIO: [OFF]';
      }
    });
  }

  // Attach hover sounds to interactive elements
  document.querySelectorAll('button, .nav-link, .engine-card, .persona-flip-card, .feed-log-item, .footer-link, .cta-terminal-btn').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      playTone(440 + Math.random() * 240, 'sine', 0.04, 0.03);
    });
  });

  // =========================================================================
  // 7. 3D Flip Card Interactions for 5 Personas
  // =========================================================================
  const personaCards = document.querySelectorAll('.persona-flip-card');
  personaCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If user clicked the simulate button inside the back face, don't just toggle flip
      if (e.target.closest('.test-persona-btn')) return;
      
      card.classList.toggle('flipped');
      playTone(620, 'sine', 0.06, 0.04);
    });
  });

  // Action button inside persona dossier to test on that specific agent
  document.querySelectorAll('.test-persona-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const preset = btn.getAttribute('data-preset') || 'Stop scrolling: AI breakdown for creators.';
      openModal(preset);
      playGlitchNoise();
    });
  });

  // =========================================================================
  // 8. 3D Wireframe Globe Canvas (Specs Column)
  // =========================================================================
  const globeCanvas = document.getElementById('wireframeGlobeCanvas');
  if (globeCanvas) {
    const ctx = globeCanvas.getContext('2d');
    const width = (globeCanvas.width = 48);
    const height = (globeCanvas.height = 48);
    const cx = width / 2;
    const cy = height / 2;
    const radius = 20;
    let angle = 0;

    function drawGlobe() {
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

      requestAnimationFrame(drawGlobe);
    }
    drawGlobe();
  }

  // =========================================================================
  // 9. Hero Waveform Telemetry Oscilloscope Canvas
  // =========================================================================
  const waveCanvas = document.getElementById('agentWaveCanvas');
  if (waveCanvas) {
    const ctx = waveCanvas.getContext('2d');
    let phase = 0;

    function resizeWave() {
      if (waveCanvas.parentElement) {
        waveCanvas.width = waveCanvas.parentElement.clientWidth;
        waveCanvas.height = 50;
      }
    }
    resizeWave();
    window.addEventListener('resize', resizeWave);

    function drawWave() {
      ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      phase += 0.05;

      const w = waveCanvas.width;
      const h = waveCanvas.height;
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

      // Telemetry frequency spikes
      if (Math.random() < 0.2) {
        const spikeX = Math.random() * w;
        ctx.strokeStyle = '#00F0FF';
        ctx.beginPath();
        ctx.moveTo(spikeX, mid - 18);
        ctx.lineTo(spikeX, mid + 18);
        ctx.stroke();
      }

      requestAnimationFrame(drawWave);
    }
    drawWave();
  }

  // =========================================================================
  // 10. Dripping Smiley Interactive Glitch
  // =========================================================================
  const smileyWrapper = document.getElementById('drippingSmiley');
  if (smileyWrapper) {
    smileyWrapper.addEventListener('click', () => {
      playGlitchNoise();
      playTone(1200, 'sawtooth', 0.15, 0.1);
      smileyWrapper.style.transform = 'scale(1.28) rotate(10deg)';
      setTimeout(() => {
        smileyWrapper.style.transform = '';
      }, 300);
    });
  }

  // =========================================================================
  // 11. Quick Specimen Simulation Terminal Modal
  // =========================================================================
  const simModal = document.getElementById('simModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const specimenInput = document.getElementById('specimenInput');
  const runQuickSimBtn = document.getElementById('runQuickSimBtn');
  const simOutput = document.getElementById('simOutput');
  const resScore = document.getElementById('resScore');
  const resHook = document.getElementById('resHook');
  const resShare = document.getElementById('resShare');
  const resCohort = document.getElementById('resCohort');
  const resDebates = document.getElementById('resDebates');

  // Trigger buttons
  const openButtons = [
    document.getElementById('heroAuditBtn'),
    document.getElementById('footerSimLink'),
  ];

  function openModal(preset = '') {
    if (preset && specimenInput) {
      specimenInput.value = preset;
    }
    if (simModal) {
      simModal.classList.add('active');
    }
    playTone(700, 'sine', 0.08, 0.05);
  }

  function closeModal() {
    if (simModal) {
      simModal.classList.remove('active');
    }
  }

  openButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && simModal && simModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Platform chips
  document.querySelectorAll('.platform-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.platform-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      playTone(550, 'sine', 0.04, 0.04);
    });
  });

  // Execute Simulation
  if (runQuickSimBtn) {
    runQuickSimBtn.addEventListener('click', () => {
      const text = specimenInput.value.trim() || 'Stop scrolling: 3 AI tools that will save you 10 hours a week.';
      runQuickSimBtn.disabled = true;
      runQuickSimBtn.textContent = '⚡ SYNTHESIZING AGENT COUNCIL...';
      playGlitchNoise();

      setTimeout(() => {
        runQuickSimBtn.disabled = false;
        runQuickSimBtn.textContent = '⚡ RUN QUICK 5-AGENT AUDIT';
        simOutput.classList.remove('hidden');

        // Derive deterministic scores based on text length & keywords
        const hasHook = /stop|why|how|secret|mistake|tools|save|hack/i.test(text);
        const hasCTA = /save|bookmark|thread|below|follow|share/i.test(text);
        
        let score = 72;
        if (hasHook) score += 12;
        if (hasCTA) score += 8;
        score = Math.min(96, Math.max(54, score));

        const hookPct = Math.min(99, score + 6);
        const sharePct = Math.max(48, score - 8);
        const topPct = Math.max(1, 100 - Math.round(score * 0.94 + 4));

        resScore.textContent = `${score}/100`;
        resHook.textContent = `${hookPct}%`;
        resShare.textContent = `${sharePct}%`;
        resCohort.textContent = `TOP ${topPct}%`;

        // Generate synthetic persona debates
        const debates = [
          {
            name: 'CASUAL SCROLLER [GEN-Z]',
            text: hasHook ? 'Opening hook stopped my thumb immediately. Good curiosity gap.' : 'Too generic opening, would scroll past within 1.2s without immediate visual punch.'
          },
          {
            name: 'SKEPTIC ANALYST',
            text: hasCTA ? 'Actionable takeaway is clear, but verify claims in comments before sharing.' : 'Lacks empirical proof points in first 3 seconds; high drop-off likelihood.'
          },
          {
            name: 'TREND HUNTER',
            text: 'High peer forwarding quotient. Will recommend save-and-share algorithm loop.'
          }
        ];

        resDebates.innerHTML = debates
          .map(
            (d) => `
          <div class="debate-bubble">
            <span class="db-persona">&gt; ${d.name}</span>
            <span class="db-text">"${d.text}"</span>
          </div>
        `
          )
          .join('');

        playTone(920, 'sine', 0.15, 0.08);
      }, 650);
    });
  }
});
