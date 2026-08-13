import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ViralityScoreBreakdown, OptimizationResult } from '../../api/types';

interface BeforeAfterStoryProps {
  originalScore: ViralityScoreBreakdown;
  optimizedScore?: ViralityScoreBreakdown;
  optimization: OptimizationResult | any;
}

export const BeforeAfterStory: React.FC<BeforeAfterStoryProps> = ({
  originalScore,
  optimizedScore,
  optimization,
}) => {
  if (!optimization) {
    return null;
  }

  const extractScore = (scoreVal: any): number => {
    if (scoreVal === undefined || scoreVal === null) return 0;
    if (typeof scoreVal === 'object' && scoreVal !== null) {
      const v = scoreVal.overall_score !== undefined
        ? scoreVal.overall_score
        : scoreVal.calibrated_virality_score || scoreVal.raw_virality_score || 0;
      return Number(v) || 0;
    }
    const num = Number(scoreVal);
    return isNaN(num) ? 0 : num;
  };

  const n = (val: any) => {
    const s = extractScore(val);
    return s <= 1.0 && s > 0 ? Math.round(s * 100) : Math.round(s);
  };

  const origTotal = n(originalScore?.calibrated_virality_score || originalScore?.raw_virality_score || optimization.original_score);
  const bestTotal = n(optimization.best_score || optimizedScore?.calibrated_virality_score);
  const delta = bestTotal - origTotal;

  const dims = optimizedScore && originalScore
    ? [
        { label: 'RETENTION', orig: n(originalScore.retention_score), opt: n(optimizedScore.retention_score) },
        { label: 'SHARING', orig: n(originalScore.shareability_score), opt: n(optimizedScore.shareability_score) },
        { label: 'ENGAGEMENT', orig: n(originalScore.engagement_score), opt: n(optimizedScore.engagement_score) },
        { label: 'CONVERSION', orig: n(originalScore.conversion_score), opt: n(optimizedScore.conversion_score) },
      ]
    : [];

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-6"
      aria-label="Optimization before and after comparison"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            05 // OPTIMIZATION LIFT
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">VARIANT BENCHMARK COMPARISON</span>
        </div>
        <span className="bg-[#07080A] px-2 py-1 border border-white/15 text-white font-bold text-[10px]">
          VARIANTS TESTED: {optimization.variants_tested || (Array.isArray(optimization.history) ? optimization.history.length : 1)}
        </span>
      </div>

      {/* Main Score Progression Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#07080A] border-2 border-white/20 p-5 font-mechanismo shadow-[3px_3px_0px_0px_#000]">
        {/* Baseline */}
        <div className="sm:col-span-4 flex flex-col">
          <span className="text-[10px] text-[#8E98AA] uppercase font-bold">BASELINE SPECIMEN SCORE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mechanismo font-black text-3xl sm:text-4xl text-[#8E98AA]">{origTotal}</span>
            <span className="text-xs text-white/40 font-bold">/100</span>
          </div>
        </div>

        {/* Delta */}
        <div className="sm:col-span-4 flex items-center justify-center gap-2 py-2 border-y sm:border-y-0 sm:border-x-2 border-white/15">
          <ArrowRight className="w-5 h-5 text-[#D4FF00]" />
          <span className="text-base sm:text-lg font-black text-[#D4FF00] font-csmigrate bg-[#D4FF00]/10 px-3 py-1 border border-[#D4FF00]/40">
            +{delta > 0 ? delta : 0} PTS LIFT
          </span>
        </div>

        {/* Optimized */}
        <div className="sm:col-span-4 flex flex-col sm:items-end">
          <span className="text-[10px] text-[#D4FF00] uppercase font-black">OPTIMIZED VARIANT SCORE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mechanismo font-black text-3xl sm:text-4xl text-[#D4FF00]">{bestTotal}</span>
            <span className="text-xs text-[#00FF41] font-bold">/100</span>
          </div>
        </div>
      </div>

      {/* Dimension Level Deltas */}
      {dims.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mechanismo text-xs">
          {dims.map((d) => {
            const dimDelta = d.opt - d.orig;
            return (
              <div
                key={d.label}
                className="p-3.5 bg-[#07080A] border-2 border-white/15 flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_#000]"
              >
                <span className="text-[10px] text-[#8E98AA] font-bold uppercase">{d.label}</span>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                  <span className="text-[#646E82] font-bold">{d.orig}</span>
                  <span className="text-white/30">→</span>
                  <span className="font-black text-white font-csmigrate text-sm">{d.opt}</span>
                  {dimDelta > 0 && (
                    <span className="text-[10px] text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.2 border border-[#D4FF00]/30">+{dimDelta}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
