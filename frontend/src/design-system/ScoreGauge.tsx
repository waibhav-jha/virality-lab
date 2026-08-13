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
  const derivedPercentile = percentileNum !== undefined
    ? (percentileNum <= 1.0 ? Math.round(percentileNum * 100) : Math.round(percentileNum))
    : Math.min(99, Math.max(1, Math.round(safeScore * 0.94 + 4)));

  const topPercent = Math.max(1, 100 - derivedPercentile);
  const formattedPercentile = `TOP ${topPercent}% COHORT`;

  return (
    <div className="relative flex flex-col items-start justify-center p-4 sm:p-6 w-full text-left cyber-scanline">
      {/* Subtle Contour Topology Background Motif */}
      <div className="absolute right-0 top-0 w-64 h-32 opacity-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <WaveformContour variant="topography" opacity={0.35} />
      </div>

      {/* Cyber Header & Reference Tag */}
      <div className="flex items-center justify-between w-full border-b border-[#00FF41]/20 pb-2 mb-4">
        <span className="font-mechanismo text-[11px] tracking-widest text-[#8E9E90] font-bold">
          [SIMULATED AUDIENCE INDEX // SCORE]
        </span>
        <span className="font-csmigrate text-[11px] text-[#000000] bg-[#00FF41] px-2 py-0.5 border border-[#00FF41] uppercase font-black shadow-[2px_2px_0px_0px_#000]">
          {currentTier}
        </span>
      </div>

      {/* Massive Cyber Metric Display */}
      <div className="flex items-baseline gap-3">
        <span
          className={clsx(
            'font-mechanismo font-black tracking-tight text-white leading-none glitch-hover select-none',
            size === 'lg' ? 'text-7xl sm:text-9xl' : size === 'md' ? 'text-6xl' : 'text-4xl'
          )}
        >
          {isNaN(displayScore) ? 0 : displayScore}
        </span>
        <div className="flex flex-col">
          <span className="font-mechanismo text-xl sm:text-2xl text-[#00FF41] font-bold">/100</span>
          <span className="font-mechanismo text-[10px] text-[#8E9E90] uppercase tracking-wider">INDEX VALUE</span>
        </div>
      </div>

      {/* Calibration Metadata Footer */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#00FF41]/20 w-full font-mechanismo text-[10px] text-[#8E9E90]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#00FF41]">●</span>
          <span>CONFIDENCE:</span>
          <span className="text-white font-bold">{confPct}%</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#00F0FF]">▲</span>
          <span>BENCHMARK:</span>
          <span className="text-white font-bold">{formattedPercentile}</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span>SAMPLE:</span>
          <span className="text-white font-bold">N=5 AUTONOMOUS</span>
        </div>
      </div>
    </div>
  );
};
