import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { OptimizationResult, CandidateVariant } from '../../api/types';
import { Button } from '../../design-system/Button';

interface OptimizationSectionProps {
  optimization: OptimizationResult | any;
  onApplyWinner: (variant: CandidateVariant) => void;
}

export const OptimizationSection: React.FC<OptimizationSectionProps> = ({
  optimization,
  onApplyWinner,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  if (!optimization) {
    return null;
  }

  // Safe numerical parser that handles numbers, nested score objects, and ratios
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

  const origScore = n(optimization.original_score);
  const bestScore = n(optimization.best_score);
  const delta = bestScore - origScore;

  // Adapt candidate variants from either candidate_variants list or history.evaluated_variants
  const rawCandidateVariants: any[] = Array.isArray(optimization.candidate_variants)
    ? optimization.candidate_variants
    : [];

  const historyVariants: any[] = Array.isArray(optimization.history)
    ? optimization.history.flatMap((iter: any) =>
        Array.isArray(iter.evaluated_variants)
          ? iter.evaluated_variants.map((ev: any) => ({
              variant_id: ev.variant?.variant_id || `var_${Math.random().toString(36).substring(2, 7)}`,
              strategy: ev.variant?.strategy_name || ev.variant?.optimization_target || 'Targeted Variant',
              caption: ev.variant?.content?.caption || ev.variant?.caption || '',
              hook: ev.variant?.content?.caption || '',
              changes_summary: Array.isArray(ev.variant?.changes) ? ev.variant.changes.join(', ') : ev.variant?.reason || '',
              simulated_score: extractScore(ev.score),
              improvement_delta: ev.comparison?.absolute_change || 0,
              is_winner: optimization.best_variant?.variant?.variant_id === ev.variant?.variant_id,
            }))
          : []
      )
    : [];

  const allVariants: CandidateVariant[] = rawCandidateVariants.length > 0
    ? rawCandidateVariants
    : historyVariants;

  // Best variant resolution
  let winner: any =
    optimization.winning_variant ||
    optimization.best_variant?.variant ||
    allVariants.find((v) => v.is_winner) ||
    allVariants[0];

  // If winner is from best_variant structure, map to CandidateVariant fields
  if (winner && !winner.caption && winner.content?.caption) {
    winner = {
      variant_id: winner.variant_id || 'winner_opt',
      strategy: winner.strategy_name || winner.optimization_target || 'Optimal Strategy',
      caption: winner.content.caption,
      hook: winner.content.caption,
      changes_summary: Array.isArray(winner.changes) ? winner.changes.join(', ') : winner.reason || '',
      is_winner: true,
    };
  }

  const otherVariants = allVariants.filter(
    (v) => v && v.variant_id !== winner?.variant_id
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (variant: CandidateVariant) => {
    setAppliedId(variant.variant_id);
    onApplyWinner(variant);
  };

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-6"
      aria-label="Optimization results and variant comparison"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            06 // VARIANT BENCHMARK
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">CANDIDATE VARIANT COMPARISON WORKBENCH</span>
        </div>
        <span className="bg-[#07080A] px-2 py-1 border border-white/15 text-white font-bold text-[10px]">
          {allVariants.length || (winner ? 1 : 0)} SYNTHESIZED VARIANTS
        </span>
      </div>

      {/* Grid of Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" role="list" aria-label="Content variants">
        {/* Left Column (or 7 cols): Strongest Variant Candidate */}
        {winner && (
          <div
            className="lg:col-span-7 bg-[#07080A] border-2 border-[#D4FF00] p-5 sm:p-6 flex flex-col justify-between gap-4 font-mechanismo relative shadow-[4px_4px_0px_0px_#D4FF00]"
            role="listitem"
            aria-label="Winning variant"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between border-b-2 border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#D4FF00] text-[#060709] px-2 py-0.5 text-xs font-black uppercase font-csmigrate shadow-[1px_1px_0px_0px_#000]">
                  OPTIMAL SPECIMEN VARIANT
                </span>
                <span className="text-[10px] text-white/70 font-bold">{winner.strategy || 'STRATEGY: REFINED HOOK'}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mechanismo font-black text-3xl text-[#D4FF00]">{bestScore}</span>
                <span className="text-xs text-[#00F0FF] font-bold">/100 (+{delta > 0 ? delta : 0})</span>
              </div>
            </div>

            {/* Specimen Content Text */}
            <div className="bg-[#0D1017] border border-white/15 p-4 font-sans text-xs sm:text-sm text-[#F4F6F8] leading-relaxed shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
              {winner.caption || winner.hook || 'No preview caption available.'}
            </div>

            {/* Changes Summary */}
            {winner.changes_summary && (
              <div className="p-3 bg-[#090C12] border-l-2 border-[#D4FF00] text-xs text-[#A2ABB9] font-sans">
                <span className="font-mechanismo text-[10px] text-[#D4FF00] uppercase block font-bold mb-0.5">
                  OPTIMIZATION HYPOTHESIS:
                </span>
                {winner.changes_summary}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-white/15 mt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={copiedId === winner.variant_id ? <Check className="w-3 h-3 text-[#D4FF00]" /> : <Copy className="w-3 h-3" />}
                onClick={() => handleCopy(winner.caption || winner.hook || '', winner.variant_id)}
                className="font-csmigrate text-xs"
              >
                {copiedId === winner.variant_id ? 'COPIED' : 'COPY SPECIMEN'}
              </Button>

              <Button
                variant="viral"
                size="sm"
                onClick={() => handleApply(winner)}
                className="font-csmigrate text-xs"
              >
                {appliedId === winner.variant_id ? 'APPLIED TO STUDIO' : 'APPLY SPECIMEN TO STUDIO'}
              </Button>
            </div>
          </div>
        )}

        {/* Right 5 Columns: Secondary Candidate Variants */}
        <div className="lg:col-span-5 flex flex-col gap-3 font-mechanismo">
          <div className="text-[11px] text-[#8E98AA] uppercase border-b-2 border-white/15 pb-1 font-bold">
            ALTERNATIVE HYPOTHESIS VARIANTS
          </div>

          {otherVariants.length === 0 ? (
            <div className="p-4 bg-[#07080A] border border-white/10 text-xs text-[#646E82]">
              NO ADDITIONAL ALTERNATIVE CANDIDATES IN CURRENT BATCH.
            </div>
          ) : (
            otherVariants.map((variant, idx) => {
              const varScore = n(variant.simulated_score || origScore);
              const varDelta = varScore - origScore;
              const isExpanded = expandedVariant === variant.variant_id;

              return (
                <div
                  key={variant.variant_id || idx}
                  className="bg-[#07080A] hover:bg-[#0E121A] border-2 border-white/15 hover:border-[#D4FF00]/50 p-4 flex flex-col gap-2 transition-all shadow-[2px_2px_0px_0px_#000]"
                  role="listitem"
                  aria-label={`Variant: ${variant.strategy || `#${idx + 2}`}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-white uppercase font-csmigrate">{variant.strategy || `VARIANT 0${idx + 2}`}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mechanismo font-bold text-white text-lg">{varScore}</span>
                      {varDelta > 0 && (
                        <span className="text-[10px] text-[#D4FF00] font-black">+{varDelta}</span>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs text-[#A2ABB9] font-sans leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {variant.caption || variant.hook}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setExpandedVariant(isExpanded ? null : variant.variant_id)}
                      className="text-[#8E98AA] hover:text-white cursor-pointer uppercase font-bold"
                    >
                      {isExpanded ? '[ COLLAPSE ]' : '[ INSPECT ]'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApply(variant)}
                      className="text-[#D4FF00] hover:underline cursor-pointer uppercase font-black font-csmigrate text-xs"
                    >
                      APPLY VARIANT →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
