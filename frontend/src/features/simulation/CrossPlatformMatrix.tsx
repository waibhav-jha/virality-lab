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
import { PlatformAlgorithmPipelineSimulator } from '../platform/PlatformAlgorithmPipelineSimulator';
import { Layers } from 'lucide-react';

interface CrossPlatformMatrixProps {
  caption: string;
  transcript?: string;
  currentPlatform: Platform;
  mediaType: MediaType;
  selectedPersonas: string[];
  objective: OptimizationObjective;
  onSelectPlatform: (platform: Platform) => void;
  onApplyAdaptedSpecimen?: (platform: Platform, adaptedCaption: string) => void;
}

export const CrossPlatformMatrix: React.FC<CrossPlatformMatrixProps> = ({
  caption,
  transcript,
  currentPlatform,
  mediaType,
  selectedPersonas,
  objective,
  onSelectPlatform,
  onApplyAdaptedSpecimen,
}) => {
  const [result, setResult] = useState<CrossPlatformMatrixResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [appliedPlatform, setAppliedPlatform] = useState<Platform | null>(null);
  const [inspectedPlatform, setInspectedPlatform] = useState<Platform | null>(null);

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

  const handleApply = (item: PlatformMatrixItem) => {
    setAppliedPlatform(item.platform);
    if (onApplyAdaptedSpecimen && item.adapted_specimen) {
      onApplyAdaptedSpecimen(item.platform, item.adapted_specimen);
    } else {
      onSelectPlatform(item.platform);
    }
  };

  if (!result) return null;

  const bestItem = result.items.find((i) => i.platform === result.best_platform) || result.items[0];

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-8"
      aria-label="Cross-Platform Algorithmic Compatibility Matrix"
    >
      {/* Section Masthead */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-4 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            04C // CROSS-PLATFORM COMPATIBILITY MATRIX
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">5-CHANNEL SIMULTANEOUS ALGORITHM AUDIT</span>
        </div>
        <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/15 shadow-[2px_2px_0px_0px_#000]">
          <Globe2 className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span className="font-bold text-white">ALL 5 PLATFORMS EVALUATED</span>
        </div>
      </div>

      {/* Top Best Match Callout Banner */}
      <div className="bg-gradient-to-r from-[#D4FF00]/15 via-[#0A0D14] to-black border-2 border-[#D4FF00] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#D4FF00]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4FF00] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <Trophy className="w-6 h-6 text-[#060709]" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mechanismo text-[11px] text-[#D4FF00] uppercase font-black tracking-wider">
              <span className="bg-[#D4FF00]/20 px-1.5 py-0.5 border border-[#D4FF00]/50">HIGHEST ALGORITHMIC SYNERGY</span>
              <span className="text-white/40">·</span>
              <span className="text-[#00FF41]">RANK #1: {bestItem.platform_name.toUpperCase()}</span>
            </div>
            <p className="font-csmigrate text-base text-white font-black mt-1">
              Score: {bestItem.score}/100 ({bestItem.tier}) · {bestItem.reach_multiplier}
            </p>
            <p className="font-mechanismo text-xs text-[#A2ABB9] mt-0.5 leading-relaxed">
              {result.distribution_strategy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="viral"
            size="sm"
            onClick={() => handleApply(bestItem)}
            className="font-csmigrate text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {appliedPlatform === bestItem.platform ? 'APPLIED TO STUDIO' : `ADAPT & TARGET ${bestItem.platform_name.toUpperCase()}`}
          </Button>
        </div>
      </div>

      {/* 5-Platform Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {result.items.map((item) => {
          const isBest = item.is_best_fit;
          const isCurrent = item.platform === currentPlatform;
          const isApplied = appliedPlatform === item.platform;
          const isInspected = inspectedPlatform === item.platform;

          return (
            <div
              key={item.platform}
              className={clsx(
                'border-2 p-4 flex flex-col justify-between gap-3 transition-all relative shadow-[3px_3px_0px_0px_#000]',
                isBest
                  ? 'border-[#D4FF00] bg-[#07080A] shadow-[4px_4px_0px_0px_#D4FF00]'
                  : isCurrent
                  ? 'border-[#00FF41] bg-[#07080A] shadow-[3px_3px_0px_0px_#00FF41]'
                  : 'border-white/15 bg-[#07080A] hover:border-[#D4FF00]/50'
              )}
            >
              <div>
                {/* Header with Badges */}
                <div className="flex items-center justify-between font-mechanismo text-[10px] mb-2">
                  <span className="font-black text-white uppercase font-csmigrate text-sm">{item.platform_name}</span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 font-black uppercase border text-[10px] font-mechanismo',
                      isBest
                        ? 'border-[#D4FF00] bg-[#D4FF00] text-[#060709]'
                        : isCurrent
                        ? 'border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41]'
                        : 'border-white/20 text-[#8E98AA]'
                    )}
                  >
                    RANK #{item.rank}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between pb-2 border-b border-white/15">
                  <div>
                    <span className="font-mechanismo text-[9px] text-[#646E82] block uppercase font-bold">
                      VIRALITY INDEX
                    </span>
                    <span
                      className={clsx(
                        'text-3xl font-black font-mechanismo',
                        item.score >= 80
                          ? 'text-[#D4FF00]'
                          : item.score >= 60
                          ? 'text-white'
                          : 'text-[#EF4444]'
                      )}
                    >
                      {item.score}
                      <span className="text-xs text-[#646E82] font-mechanismo">/100</span>
                    </span>
                  </div>

                  <span className="font-mechanismo text-[10px] text-[#8E98AA] font-bold uppercase text-right max-w-[90px] leading-tight">
                    {item.tier}
                  </span>
                </div>

                {/* Multiplier Tag */}
                <div className="mt-2 font-mechanismo text-[11px] text-[#D4FF00] font-black">
                  {item.reach_multiplier}
                </div>

                {/* Sub Score Meters */}
                <div className="flex flex-col gap-1.5 mt-3 font-mechanismo text-[10px]">
                  <div className="flex justify-between text-[#8E98AA]">
                    <span>RETENTION:</span>
                    <span className="text-white font-bold">{item.retention_score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0E1015] border border-white/15 overflow-hidden">
                    <div
                      style={{ width: `${item.retention_score}%` }}
                      className="h-full bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]"
                    />
                  </div>

                  <div className="flex justify-between text-[#8E98AA] mt-1">
                    <span>ENGAGEMENT:</span>
                    <span className="text-white font-bold">{item.engagement_score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0E1015] border border-white/15 overflow-hidden">
                    <div
                      style={{ width: `${item.engagement_score}%` }}
                      className="h-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]"
                    />
                  </div>

                  <div className="flex justify-between text-[#8E98AA] mt-1">
                    <span>SHAREABILITY:</span>
                    <span className="text-white font-bold">{item.shareability_score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0E1015] border border-white/15 overflow-hidden">
                    <div
                      style={{ width: `${item.shareability_score}%` }}
                      className="h-full bg-[#FF0055] shadow-[0_0_6px_#FF0055]"
                    />
                  </div>
                </div>

                {/* Tailored Platform Tweak */}
                <div className="mt-3 bg-[#060709] p-2.5 border border-white/10 font-sans text-xs text-[#A2ABB9] leading-relaxed shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                  <span className="font-mechanismo text-[9px] text-[#646E82] uppercase block font-bold mb-0.5">
                    PLATFORM TWEAK:
                  </span>
                  {item.platform_tweak}
                </div>

                {/* Adapted Specimen Preview */}
                {item.adapted_specimen && (
                  <div className="mt-2 bg-[#0C0F15] p-2 border-l-2 border-[#00F0FF] font-sans text-[11px] text-white/90 leading-snug">
                    <span className="font-mechanismo text-[8px] text-[#00F0FF] uppercase block font-bold mb-0.5">
                      ADAPTED SPECIMEN:
                    </span>
                    <p className="line-clamp-3 italic text-[#DDE2EA]">{item.adapted_specimen}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 mt-3">
                <button
                  type="button"
                  onClick={() => setInspectedPlatform(isInspected ? null : item.platform)}
                  className={clsx(
                    'w-full py-1.5 font-csmigrate text-[11px] uppercase font-black border transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#000]',
                    isInspected
                      ? 'border-[#00FF41] bg-[#00FF41] text-black shadow-[2px_2px_0px_0px_#00FF41]'
                      : 'border-white/25 bg-[#0D1117] text-[#D4FF00] hover:border-[#D4FF00]'
                  )}
                >
                  <Layers className="w-3 h-3" />
                  {isInspected ? 'HIDE PIPELINE' : 'INSPECT PIPELINE'}
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(item)}
                  className={clsx(
                    'w-full py-2 font-csmigrate text-xs uppercase font-black border-2 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]',
                    isApplied
                      ? 'border-[#D4FF00] bg-[#D4FF00] text-[#060709]'
                      : 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#060709]'
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  {isApplied ? 'APPLIED TO STUDIO' : 'ADAPT & APPLY'}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPlatform(item.platform)}
                  className="w-full py-1 font-mechanismo text-[10px] uppercase font-bold border border-white/15 bg-[#0A0D14] text-[#8E98AA] hover:text-white hover:border-white/40"
                >
                  {isCurrent ? 'ACTIVE TARGET' : 'TARGET CHANNEL ONLY'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Algorithm Pipeline Simulator for the Selected Platform */}
      {inspectedPlatform && (
        <div className="flex flex-col gap-2 pt-4 border-t-2 border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#D4FF00] uppercase font-csmigrate">
              DETAILED RECTIFICATION // {inspectedPlatform.toUpperCase()} COHORT STAGE-GATE SIMULATION
            </span>
            <button
              type="button"
              onClick={() => setInspectedPlatform(null)}
              className="text-[10px] text-[#8E98AA] hover:text-white uppercase font-bold cursor-pointer"
            >
              ✕ CLOSE INSPECTOR
            </button>
          </div>
          <PlatformAlgorithmPipelineSimulator
            platform={inspectedPlatform}
            caption={caption}
            transcript={transcript}
            onApplyOptimizedFix={(fix) => {
              if (onApplyAdaptedSpecimen) {
                onApplyAdaptedSpecimen(inspectedPlatform, `${caption}\n\n${fix}`);
              }
            }}
          />
        </div>
      )}
    </section>
  );
};
