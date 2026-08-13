import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Globe2,
  Trophy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Share2,
  RefreshCw,
} from 'lucide-react';
import {
  Platform,
  MediaType,
  OptimizationObjective,
  CrossPlatformMatrixResult,
  PlatformMatrixItem,
} from '../../api/types';
import { runCrossPlatformMatrixSimulation } from '../../engine/browserSimulator';
import { Button } from '../../design-system/Button';

interface CrossPlatformMatrixProps {
  caption: string;
  transcript?: string;
  currentPlatform: Platform;
  mediaType: MediaType;
  selectedPersonas: string[];
  objective: OptimizationObjective;
  onSelectPlatform: (platform: Platform) => void;
}

export const CrossPlatformMatrix: React.FC<CrossPlatformMatrixProps> = ({
  caption,
  transcript,
  currentPlatform,
  mediaType,
  selectedPersonas,
  objective,
  onSelectPlatform,
}) => {
  const [result, setResult] = useState<CrossPlatformMatrixResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    runMatrix();
  }, [caption, transcript, mediaType, selectedPersonas, objective]);

  const runMatrix = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const matrixResult = runCrossPlatformMatrixSimulation({
        caption,
        transcript,
        platform: currentPlatform,
        mediaType,
        selectedPersonas,
        objective,
      });
      setResult(matrixResult);
      setIsSimulating(false);
    }, 200);
  };

  if (!result) return null;

  const bestItem = result.items.find((i) => i.platform === result.best_platform) || result.items[0];

  return (
    <section
      className="w-full bg-[#0E1013] border border-white/15 p-6 sm:p-8 text-left flex flex-col gap-8 corner-ticks"
      aria-label="Cross-Platform Algorithmic Compatibility Matrix"
    >
      {/* Section Masthead */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-bold">04C // CROSS-PLATFORM COMPATIBILITY MATRIX</span>
          <span>::</span>
          <span>5-CHANNEL SIMULTANEOUS ALGORITHM AUDIT</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>ALL PLATFORMS EVALUATED</span>
        </div>
      </div>

      {/* Top Best Match Callout Banner */}
      <div className="bg-gradient-to-r from-[#D4FF00]/15 via-black/80 to-black/40 border border-[#D4FF00]/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4FF00]/20 border border-[#D4FF00]/60 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-[#D4FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#D4FF00] uppercase font-bold tracking-wider">
              <span>HIGHEST ALGORITHMIC SYNERGY</span>
              <span>·</span>
              <span>RANK #1: {bestItem.platform_name.toUpperCase()}</span>
            </div>
            <p className="font-sans text-base text-white font-bold mt-0.5">
              Score: {bestItem.score}/100 ({bestItem.tier}) · {bestItem.reach_multiplier}
            </p>
            <p className="font-sans text-xs text-[#9DA7B8] mt-1 leading-relaxed">
              {result.distribution_strategy}
            </p>
          </div>
        </div>

        {currentPlatform !== bestItem.platform && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectPlatform(bestItem.platform)}
            className="shrink-0 font-mono-tech text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            TARGET {bestItem.platform_name.toUpperCase()}
          </Button>
        )}
      </div>

      {/* 5-Platform Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {result.items.map((item) => {
          const isBest = item.is_best_fit;
          const isCurrent = item.platform === currentPlatform;

          return (
            <div
              key={item.platform}
              className={clsx(
                'border p-4 flex flex-col justify-between gap-3 transition-all relative',
                isBest
                  ? 'border-[#D4FF00]/60 bg-white/[0.03] shadow-[0_0_20px_rgba(212,255,0,0.06)]'
                  : isCurrent
                  ? 'border-cyan-400/40 bg-white/[0.02]'
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              )}
            >
              <div>
                {/* Header with Badges */}
                <div className="flex items-center justify-between font-mono-tech text-[10px] mb-2">
                  <span className="font-bold text-white uppercase">{item.platform_name}</span>
                  <span
                    className={clsx(
                      'px-1.5 py-0.2 font-bold uppercase border text-[9px]',
                      isBest
                        ? 'border-[#D4FF00]/60 bg-[#D4FF00]/20 text-[#D4FF00]'
                        : 'border-white/10 text-[#7E8798]'
                    )}
                  >
                    RANK #{item.rank}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between pb-2 border-b border-white/10">
                  <div>
                    <span className="font-mono-tech text-[9px] text-[#5B6474] block uppercase">
                      VIRALITY INDEX
                    </span>
                    <span
                      className={clsx(
                        'text-2xl font-bold font-mono-tech',
                        item.score >= 80
                          ? 'text-[#D4FF00]'
                          : item.score >= 60
                          ? 'text-white'
                          : 'text-amber-400'
                      )}
                    >
                      {item.score}
                      <span className="text-xs text-[#5B6474]">/100</span>
                    </span>
                  </div>

                  <span className="font-mono-tech text-[9px] text-[#9DA7B8] uppercase text-right max-w-[90px] leading-tight">
                    {item.tier}
                  </span>
                </div>

                {/* Multiplier Tag */}
                <div className="mt-2 font-mono-tech text-[10px] text-[#D4FF00]">
                  {item.reach_multiplier}
                </div>

                {/* Sub Score Meters */}
                <div className="flex flex-col gap-1.5 mt-3 font-mono-tech text-[9px]">
                  <div className="flex justify-between text-[#7E8798]">
                    <span>RETENTION:</span>
                    <span className="text-white">{item.retention_score}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10">
                    <div
                      style={{ width: `${item.retention_score}%` }}
                      className="h-full bg-[#D4FF00]"
                    />
                  </div>

                  <div className="flex justify-between text-[#7E8798] mt-1">
                    <span>ENGAGEMENT:</span>
                    <span className="text-white">{item.engagement_score}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10">
                    <div
                      style={{ width: `${item.engagement_score}%` }}
                      className="h-full bg-cyan-400"
                    />
                  </div>

                  <div className="flex justify-between text-[#7E8798] mt-1">
                    <span>SHAREABILITY:</span>
                    <span className="text-white">{item.shareability_score}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10">
                    <div
                      style={{ width: `${item.shareability_score}%` }}
                      className="h-full bg-purple-400"
                    />
                  </div>
                </div>

                {/* Tailored Platform Tweak */}
                <div className="mt-3 bg-black/60 p-2 border border-white/5 font-sans text-[11px] text-[#9DA7B8] leading-relaxed">
                  <span className="font-mono-tech text-[9px] text-[#5B6474] uppercase block font-bold mb-0.5">
                    PLATFORM TWEAK:
                  </span>
                  {item.platform_tweak}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectPlatform(item.platform)}
                className={clsx(
                  'w-full py-1.5 font-mono-tech text-[10px] uppercase font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer mt-2',
                  isCurrent
                    ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 bg-white/5 text-[#7E8798] hover:text-white hover:border-white/30'
                )}
              >
                {isCurrent ? 'ACTIVE TARGET' : `SET AS TARGET`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
