import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Cpu, Zap, Activity } from 'lucide-react';

interface CyberPortalCurtainProps {
  isActive: boolean;
  targetView: 'landing' | 'studio';
  telemetryText?: string;
}

export const CyberPortalCurtain: React.FC<CyberPortalCurtainProps> = ({
  isActive,
  targetView,
  telemetryText = 'ENGAGING AUDIENCE SIMULATION MATRIX',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    // Smooth deterministic telemetry progress ramp
    const start = performance.now();
    const duration = 1050;

    let animId: number;
    const updateProgress = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        animId = requestAnimationFrame(updateProgress);
      }
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center overflow-hidden transition-all duration-300 font-mechanismo',
        isActive ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden="true"
    >
      {/* Dark Cyber Backdrop with High-Tech Grid */}
      <div className="absolute inset-0 bg-[#060709]/95 backdrop-blur-xl transition-opacity duration-300" />
      <div className="absolute inset-0 cyber-matrix-bg opacity-40 animate-pulse" />

      {/* Laser Scanning Beam */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4FF00] to-transparent shadow-[0_0_20px_#D4FF00,0_0_40px_#00FF41] animate-laser-scan-fast z-10" />

      {/* Radial Energy Bloom */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#D4FF00]/10 blur-[100px] pointer-events-none animate-pulse" />

      {/* Corner HUD Telemetry Frames */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 text-[10px] text-[#A2ABB9] border-l-2 border-t-2 border-[#D4FF00] p-2 bg-black/40">
        <span className="text-[#D4FF00] font-black">SYS_WARP // PORTAL_TRANSIT</span>
        <span className="font-mono">TARGET: [{targetView.toUpperCase()}_ENVIRONMENT]</span>
        <span className="text-[#00FF41]">COHORTS: 05 SYNCHRONIZED</span>
      </div>

      <div className="absolute top-6 right-6 flex flex-col items-end gap-1 text-[10px] text-[#A2ABB9] border-r-2 border-t-2 border-[#D4FF00] p-2 bg-black/40 text-right">
        <span className="text-[#D4FF00] font-black">NEURAL_SYNAPSE // ACTIVE</span>
        <span className="font-mono">STABILITY: 99.8%</span>
        <span className="text-[#38BDF8]">LATENCY: 0.04ms</span>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] text-[#A2ABB9] border-l-2 border-b-2 border-white/30 p-2 bg-black/40">
        <Activity className="w-3.5 h-3.5 text-[#00FF41] animate-pulse" />
        <span>REPRESENTATIVE SAMPLING RUNNING</span>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] text-[#A2ABB9] border-r-2 border-b-2 border-white/30 p-2 bg-black/40">
        <span className="text-[#D4FF00] font-mono">FRAME_BUFFER: FLUSHED</span>
      </div>

      {/* Center Holographic Portal Card */}
      <div className="relative z-20 flex flex-col items-center gap-5 p-8 max-w-md w-full mx-4 bg-[#07080A] border-2 border-[#D4FF00] shadow-[0_0_30px_rgba(212,255,0,0.25),8px_8px_0px_0px_#000] text-center">
        {/* Animated Icon Reticle */}
        <div className="relative w-16 h-16 flex items-center justify-center bg-[#0E1015] border-2 border-[#D4FF00]">
          <Zap className="w-8 h-8 text-[#D4FF00] animate-bounce" />
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
        </div>

        {/* Title & Telemetry Status */}
        <div className="flex flex-col gap-1.5">
          <span className="font-astroda text-xl sm:text-2xl text-white tracking-widest uppercase">
            {targetView === 'studio' ? 'WARPING TO STUDIO' : 'RETURNING TO PORTAL'}
          </span>
          <span className="text-xs text-[#D4FF00] font-black uppercase tracking-wider font-csmigrate">
            {telemetryText}
          </span>
        </div>

        {/* Progress Bar & Telemetry */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E98AA]">
            <span>SYNAPSE_TRANSFER</span>
            <span className="text-[#00FF41] font-bold">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-[#0E1015] border border-white/20 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
            <div
              className="h-full bg-gradient-to-r from-[#D4FF00] via-[#00FF41] to-[#D4FF00] shadow-[0_0_12px_#D4FF00] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="text-[10px] text-[#646E82] font-mono tracking-wider">
          VIRALITY LAB // PREDICTIVE ENGINE V0.9
        </span>
      </div>
    </div>
  );
};
