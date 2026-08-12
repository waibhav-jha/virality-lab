import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { WaveformContour } from '../components/WaveformContour';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  confidence?: number; // 0 to 1 or 0 to 100
  percentile?: number;
  tier?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score = 0,
  confidence = 0.85,
  percentile,
  tier,
  size = 'lg',
  animated = true,
}) => {
  const safeScore = isNaN(Number(score)) ? 0 : Number(score);
  const [displayScore, setDisplayScore] = useState(animated ? 0 : safeScore);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(safeScore);
      return;
    }
    const duration = 800;
    const startTime = performance.now();
    const target = Math.min(100, Math.max(0, Math.round(safeScore)));

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [safeScore, animated]);

  const getTierLabel = (val: number) => {
    if (val >= 80) return 'BREAKOUT POTENTIAL';
    if (val >= 65) return 'STRONG TRACTION';
    if (val >= 45) return 'MODERATE ENGAGEMENT';
    return 'HIGH FRICTION DROP-OFF';
  };

  const currentTier = tier || getTierLabel(safeScore);

  const confNum = confidence !== undefined && !isNaN(Number(confidence)) ? Number(confidence) : 0.85;
  const confPct = confNum <= 1.0 && confNum > 0 ? Math.round(confNum * 100) : Math.round(confNum);

  const percentileNum = percentile !== undefined && !isNaN(Number(percentile)) ? Number(percentile) : undefined;
  const formattedPercentile = percentileNum !== undefined
    ? `TOP ${Math.max(1, 100 - (percentileNum <= 1.0 ? Math.round(percentileNum * 100) : Math.round(percentileNum)))}%`
    : 'BENCHMARK N/A';

  return (
    <div className="relative flex flex-col items-start justify-center p-4 sm:p-6 w-full text-left">
      {/* Subtle Contour Topology Background Motif */}
      <div className="absolute right-0 top-0 w-64 h-32 opacity-15 pointer-events-none overflow-hidden" aria-hidden="true">
        <WaveformContour variant="topography" opacity={0.35} />
      </div>

      {/* Technical Header & Reference Tag */}
      <div className="flex items-center justify-between w-full border-b border-white/10 pb-2 mb-4">
        <span className="tech-label text-[11px] tracking-widest text-[#9DA7B8]">
          SIMULATED AUDIENCE INDEX // SCORE
        </span>
        <span className="font-mono-tech text-[10px] text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 border border-[#D4FF00]/30 uppercase font-semibold">
          {currentTier}
        </span>
      </div>

      {/* Massive Editorial Metric Display */}
      <div className="flex items-baseline gap-2">
        <span
          className={clsx(
            'font-display font-black tracking-tighter text-white leading-none',
            size === 'lg' ? 'text-6xl sm:text-8xl' : size === 'md' ? 'text-5xl' : 'text-3xl'
          )}
        >
          {isNaN(displayScore) ? 0 : displayScore}
        </span>
        <div className="flex flex-col">
          <span className="font-mono-tech text-lg sm:text-2xl text-white/40 font-bold">/100</span>
          <span className="font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-wider">INDEX VALUE</span>
        </div>
      </div>

      {/* Precision Calibrated Horizontal Gauge */}
      <div className="w-full mt-4">
        <div className="relative h-2 w-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full bg-[#D4FF00] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, isNaN(displayScore) ? 0 : displayScore))}%` }}
          />
        </div>
        {/* Scale Coordinates */}
        <div className="flex justify-between font-mono-tech text-[9px] text-white/30 mt-1 uppercase">
          <span>00 [MIN]</span>
          <span>50 [MEDIAN]</span>
          <span>100 [MAX REACH]</span>
        </div>
      </div>

      {/* Technical Metadata Ledger */}
      <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-3 border-t border-white/10 font-mono-tech text-xs">
        <div>
          <span className="text-[#5B6474] text-[10px] block uppercase">CONFIDENCE CALIBRATION</span>
          <span className="text-white font-bold">{confPct}% RELIABILITY</span>
        </div>
        <div>
          <span className="text-[#5B6474] text-[10px] block uppercase">COHORT PERCENTILE</span>
          <span className="text-white font-bold">{formattedPercentile}</span>
        </div>
      </div>
    </div>
  );
};
