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
      className="w-full bg-[#0E1013] border border-white/15 p-6 sm:p-8 text-left flex flex-col gap-6 corner-ticks"
      aria-label="Optimization before and after comparison"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-bold">05 // OPTIMIZATION LIFT</span>
          <span>::</span>
          <span>VARIANT BENCHMARK COMPARISON</span>
        </div>
        <span>VARIANTS TESTED: {optimization.variants_tested || (Array.isArray(optimization.history) ? optimization.history.length : 1)}</span>
      </div>

      {/* Main Score Progression Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#07080A] border border-white/10 p-5 font-mono-tech">
        {/* Baseline */}
        <div className="sm:col-span-4 flex flex-col">
          <span className="text-[10px] text-[#7E8798] uppercase">BASELINE SPECIMEN SCORE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-display font-black text-3xl sm:text-4xl text-[#9DA7B8]">{origTotal}</span>
            <span className="text-xs text-white/40">/100</span>
          </div>
        </div>

        {/* Delta */}
        <div className="sm:col-span-4 flex items-center justify-center gap-2 py-2 border-y sm:border-y-0 sm:border-x border-white/10">
          <ArrowRight className="w-4 h-4 text-[#D4FF00]" />
          <span className="text-sm sm:text-base font-bold text-[#D4FF00]">
            +{delta > 0 ? delta : 0} PTS LIFT
          </span>
        </div>

        {/* Optimized */}
        <div className="sm:col-span-4 flex flex-col sm:items-end">
          <span className="text-[10px] text-[#D4FF00] uppercase font-bold">OPTIMIZED VARIANT SCORE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-display font-black text-3xl sm:text-4xl text-[#D4FF00]">{bestTotal}</span>
            <span className="text-xs text-white/40">/100</span>
          </div>
        </div>
      </div>

      {/* Dimension Level Deltas */}
      {dims.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-tech text-xs">
          {dims.map((d) => {
            const dimDelta = d.opt - d.orig;
            return (
              <div
                key={d.label}
                className="p-3 bg-white/[0.02] border border-white/10 flex flex-col gap-1"
              >
                <span className="text-[10px] text-[#7E8798]">{d.label}</span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#5B6474]">{d.orig}</span>
                  <span className="text-white/40">→</span>
                  <span className="font-bold text-white">{d.opt}</span>
                  {dimDelta > 0 && (
                    <span className="text-[10px] text-[#D4FF00] font-bold">+{dimDelta}</span>
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
