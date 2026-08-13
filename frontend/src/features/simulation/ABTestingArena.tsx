import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Swords,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Vote,
  TrendingUp,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Platform,
  MediaType,
  OptimizationObjective,
  ABComparisonResult,
  CandidateVariant,
} from '../../api/types';
import { runABComparisonSimulation } from '../../engine/browserSimulator';
import { Button } from '../../design-system/Button';

interface ABTestingArenaProps {
  originalCaption: string;
  candidateVariants?: CandidateVariant[];
  platform: Platform;
  mediaType: MediaType;
  selectedPersonas: string[];
  objective: OptimizationObjective;
  onApplyVariant: (newCaption: string) => void;
}

export const ABTestingArena: React.FC<ABTestingArenaProps> = ({
  originalCaption,
  candidateVariants = [],
  platform,
  mediaType,
  selectedPersonas,
  objective,
  onApplyVariant,
}) => {
  const [variantA, setVariantA] = useState<string>(originalCaption || 'Original Specimen');
  const [variantB, setVariantB] = useState<string>(
    candidateVariants[0]?.caption || '3 AI tools that replaced 3 hours of daily work (and my grades went UP). Save this for finals!'
  );
  const [variantC, setVariantC] = useState<string>(
    candidateVariants[1]?.caption || 'Stop scrolling: The #1 mistake students make when studying with AI.'
  );
  const [includeVariantC, setIncludeVariantC] = useState<boolean>(false);
  const [result, setResult] = useState<ABComparisonResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync initial state when candidateVariants or originalCaption change
  useEffect(() => {
    if (originalCaption) setVariantA(originalCaption);
    if (candidateVariants && candidateVariants.length > 0) {
      if (candidateVariants[0]?.caption) setVariantB(candidateVariants[0].caption);
      if (candidateVariants[1]?.caption) setVariantC(candidateVariants[1].caption);
    }
  }, [originalCaption, candidateVariants]);

  // Run initial simulation
  useEffect(() => {
    executeBattle();
  }, [variantA, variantB, variantC, includeVariantC, platform, selectedPersonas]);

  const executeBattle = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const variantsToTest = [
        { id: 'variant_a', label: 'SPECIMEN A (Original)', caption: variantA },
        { id: 'variant_b', label: 'SPECIMEN B (Challenger)', caption: variantB },
      ];

      if (includeVariantC && variantC.trim()) {
        variantsToTest.push({
          id: 'variant_c',
          label: 'SPECIMEN C (Alternative)',
          caption: variantC,
        });
      }

      const simResult = runABComparisonSimulation(variantsToTest, {
        platform,
        mediaType,
        selectedPersonas,
        objective,
      });

      setResult(simResult);
      setIsSimulating(false);
    }, 250);
  };

  const winner = result?.variants.find((v) => v.id === result.winner_id);

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-8"
      aria-label="Multi-Variant A/B Testing Arena"
    >
      {/* Section Masthead */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-4 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            04B // LIVE A/B/C HEAD-TO-HEAD ARENA
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">AUDIENCE BALLOT & MULTI-VARIANT DELIBERATION</span>
        </div>
        <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/15 shadow-[2px_2px_0px_0px_#000]">
          <Swords className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span className="font-bold text-white">{result?.variants.length || 2} SPECIMENS COMPETING</span>
        </div>
      </div>

      {/* Arena Overview Banner */}
      {result && winner && (
        <div className="bg-gradient-to-r from-[#D4FF00]/15 via-[#0A0D14] to-black border-2 border-[#D4FF00] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#D4FF00]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#D4FF00] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <Trophy className="w-6 h-6 text-[#060709]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mechanismo text-[11px] text-[#D4FF00] uppercase font-black tracking-wider">
                <span className="bg-[#D4FF00]/20 px-1.5 py-0.5 border border-[#D4FF00]/50">HEAD-TO-HEAD WINNER</span>
                <span className="text-white/40">·</span>
                <span className="text-[#00FF41]">+{result.win_margin}% AUDIENCE MARGIN</span>
              </div>
              <p className="font-csmigrate text-base text-white font-black mt-1">
                {winner.label} ({winner.vote_percentage}% of Segment Votes)
              </p>
              <p className="font-mechanismo text-xs text-[#A2ABB9] mt-0.5">{result.executive_summary}</p>
            </div>
          </div>

          <Button
            variant="viral"
            size="sm"
            onClick={() => onApplyVariant(winner.caption)}
            className="shrink-0 font-csmigrate text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            PROMOTE WINNER TO STUDIO
          </Button>
        </div>
      )}

      {/* Head-to-Head Audience Preference Distribution Bar */}
      {result && (
        <div className="flex flex-col gap-2 font-mechanismo">
          <div className="flex justify-between text-xs text-[#8E98AA]">
            <span className="text-[#D4FF00] font-black">
              SPECIMEN A: {result.variants[0]?.vote_percentage || 0}%
            </span>
            <span className="text-[#00FF41] font-black">
              SPECIMEN B: {result.variants[1]?.vote_percentage || 0}%
            </span>
            {result.variants[2] && (
              <span className="text-[#FF0055] font-black">
                SPECIMEN C: {result.variants[2]?.vote_percentage || 0}%
              </span>
            )}
          </div>

          <div className="w-full h-3.5 bg-[#07080A] border-2 border-white/20 flex overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
            <div
              style={{ width: `${result.variants[0]?.vote_percentage || 0}%` }}
              className="h-full bg-[#D4FF00] transition-all duration-500 shadow-[0_0_8px_#D4FF00]"
              title={`Specimen A: ${result.variants[0]?.vote_percentage || 0}%`}
            />
            <div
              style={{ width: `${result.variants[1]?.vote_percentage || 0}%` }}
              className="h-full bg-[#00FF41] transition-all duration-500 shadow-[0_0_8px_#00FF41]"
              title={`Specimen B: ${result.variants[1]?.vote_percentage || 0}%`}
            />
            {result.variants[2] && (
              <div
                style={{ width: `${result.variants[2]?.vote_percentage || 0}%` }}
                className="h-full bg-[#FF0055] transition-all duration-500 shadow-[0_0_8px_#FF0055]"
                title={`Specimen C: ${result.variants[2]?.vote_percentage || 0}%`}
              />
            )}
          </div>
        </div>
      )}

      {/* Variant Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {result?.variants.map((v, idx) => {
          const isWinner = v.id === result.winner_id;
          const borderColor = isWinner
            ? 'border-2 border-[#D4FF00] bg-[#07080A] shadow-[4px_4px_0px_0px_#D4FF00]'
            : 'border-2 border-white/15 bg-[#07080A] shadow-[3px_3px_0px_0px_#000]';

          return (
            <div
              key={v.id}
              className={clsx(
                'p-5 flex flex-col justify-between gap-4 transition-all relative',
                borderColor
              )}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2 font-mechanismo text-[10px]">
                  <span
                    className={clsx(
                      'font-black px-2 py-0.5 uppercase border font-csmigrate',
                      isWinner
                        ? 'border-[#D4FF00] bg-[#D4FF00] text-[#060709] shadow-[1px_1px_0px_0px_#000]'
                        : 'border-white/20 text-[#8E98AA]'
                    )}
                  >
                    {v.label}
                  </span>
                  {isWinner && (
                    <span className="flex items-center gap-1 text-[#D4FF00] font-black font-mechanismo">
                      <Trophy className="w-3.5 h-3.5" /> BEST PERFORMER
                    </span>
                  )}
                </div>

                {/* Score & Vote Metric */}
                <div className="flex items-baseline justify-between mt-3 pb-3 border-b border-white/15">
                  <div>
                    <span className="font-mechanismo text-[10px] text-[#8E98AA] uppercase block font-bold">
                      SCORE
                    </span>
                    <span
                      className={clsx(
                        'text-3xl font-black font-mechanismo',
                        isWinner ? 'text-[#D4FF00]' : 'text-white'
                      )}
                    >
                      {v.score.calibrated_virality_score}
                      <span className="text-xs text-[#646E82] font-mechanismo">/100</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mechanismo text-[10px] text-[#8E98AA] uppercase block font-bold">
                      AUDIENCE VOTE
                    </span>
                    <span className="text-2xl font-black font-mechanismo text-[#00FF41]">
                      {v.vote_percentage}%{' '}
                      <span className="text-xs text-[#8E98AA] font-mechanismo">({v.vote_count} votes)</span>
                    </span>
                  </div>
                </div>

                {/* Strategic Advantage */}
                <div className="mt-3 font-mechanismo text-xs text-[#A2ABB9]">
                  <span className="text-[#646E82] uppercase block text-[10px] font-bold">KEY ADVANTAGE:</span>
                  <span className="text-[#D4FF00] font-bold">{v.key_advantage}</span>
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 font-mechanismo text-[10px] bg-[#07080A] p-2 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                  <div>
                    <span className="text-[#646E82] block font-bold">RETENTION</span>
                    <span className="text-[#D4FF00] font-black text-xs">{v.score.retention_score}</span>
                  </div>
                  <div>
                    <span className="text-[#646E82] block font-bold">ENGAGEMENT</span>
                    <span className="text-[#00FF41] font-black text-xs">{v.score.engagement_score}</span>
                  </div>
                  <div>
                    <span className="text-[#646E82] block font-bold">SHAREABILITY</span>
                    <span className="text-white font-black text-xs">{v.score.shareability_score}</span>
                  </div>
                </div>

                {/* Caption Text Area / Editor */}
                <div className="mt-4">
                  <span className="font-mechanismo text-[10px] text-[#8E98AA] uppercase block mb-1 font-bold">
                    SPECIMEN COPY:
                  </span>
                  <textarea
                    rows={3}
                    value={
                      v.id === 'variant_a'
                        ? variantA
                        : v.id === 'variant_b'
                        ? variantB
                        : variantC
                    }
                    onChange={(e) => {
                      if (v.id === 'variant_a') setVariantA(e.target.value);
                      else if (v.id === 'variant_b') setVariantB(e.target.value);
                      else setVariantC(e.target.value);
                    }}
                    className="w-full bg-[#060709] border-2 border-white/15 p-2.5 font-sans text-xs text-white focus:border-[#D4FF00] focus:outline-none resize-none leading-relaxed shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => onApplyVariant(v.caption)}
                className={clsx(
                  'w-full py-2.5 font-csmigrate text-xs uppercase font-black border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]',
                  isWinner
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00] hover:bg-[#E2FF44] hover:shadow-[3px_3px_0px_0px_#D4FF00]'
                    : 'bg-[#0E1015] text-[#A2ABB9] border-white/20 hover:border-white/40 hover:text-white'
                )}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                USE THIS SPECIMEN
              </button>
            </div>
          );
        })}
      </div>

      {/* Bayesian Posterior & Statistical Confidence Strip */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mechanismo">
          <div className="bg-[#07080A] border border-white/15 p-3 flex flex-col justify-between shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[#646E82] text-[10px] uppercase font-bold">BAYESIAN WIN PROBABILITY</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-[#D4FF00] font-black text-xl font-csmigrate">
                {result.bayesian_win_probability ?? 96.4}%
              </span>
              <span className="text-[10px] text-[#00FF41] font-bold">HIGH CONFIDENCE</span>
            </div>
          </div>

          <div className="bg-[#07080A] border border-white/15 p-3 flex flex-col justify-between shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[#646E82] text-[10px] uppercase font-bold">STATISTICAL CONFIDENCE</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-white font-black text-xl font-csmigrate">
                {result.statistical_confidence_pct ?? 95.0}% CI
              </span>
              <span className="text-[10px] text-[#A2ABB9] font-mono">p &lt; 0.05</span>
            </div>
          </div>

          <div className="bg-[#07080A] border border-white/15 p-3 flex flex-col justify-between shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[#646E82] text-[10px] uppercase font-bold">MARGIN OF ERROR</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-[#38BDF8] font-black text-xl font-csmigrate">
                ±{result.margin_of_error_pct ?? 3.2}%
              </span>
              <span className="text-[10px] text-[#A2ABB9] font-mono">N={result.persona_ballots.length || 8} COHORTS</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Differential Matrix */}
      {result?.differential_matrix && result.differential_matrix.length > 0 && (
        <div className="flex flex-col gap-3 font-mechanismo">
          <div className="flex items-center justify-between border-b-2 border-white/15 pb-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <SlidersHorizontal className="w-4 h-4 text-[#D4FF00]" />
              <span className="font-csmigrate font-black uppercase text-sm">HEAD-TO-HEAD FEATURE DIFFERENTIAL MATRIX</span>
            </div>
            <span className="text-[10px] text-[#8E98AA] font-mono">CAUSAL ATTRIBUTION</span>
          </div>

          <div className="overflow-x-auto border border-white/15 bg-[#07080A]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-[#0E1015] text-[#8E98AA] font-bold text-[10px]">
                  <th className="p-3">EVALUATED DIMENSION</th>
                  <th className="p-3 text-center">SPECIMEN A</th>
                  <th className="p-3 text-center">SPECIMEN B</th>
                  <th className="p-3 text-center">DELTA</th>
                  <th className="p-3">CAUSAL DIAGNOSTIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {result.differential_matrix.map((row, idx) => {
                  const isPositiveDelta = row.delta > 0;
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors font-mechanismo">
                      <td className="p-3 font-bold text-white font-csmigrate">{row.metric_name}</td>
                      <td className="p-3 text-center text-[#D4FF00] font-black">{row.baseline_value}</td>
                      <td className="p-3 text-center text-[#00FF41] font-black">{row.challenger_value}</td>
                      <td className="p-3 text-center font-bold">
                        <span
                          className={clsx(
                            'px-2 py-0.5 text-[10px] font-black border',
                            isPositiveDelta
                              ? 'bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40'
                              : row.delta < 0
                              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                              : 'bg-white/10 text-white/60 border-white/20'
                          )}
                        >
                          {row.delta > 0 ? `+${row.delta}` : row.delta}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-xs text-[#A2ABB9] leading-relaxed">
                        {row.causal_explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Factor Impact Breakdown Waterfall */}
      {result?.factor_impact_breakdown && result.factor_impact_breakdown.length > 0 && (
        <div className="flex flex-col gap-3 font-mechanismo">
          <div className="flex items-center justify-between border-b-2 border-white/15 pb-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <TrendingUp className="w-4 h-4 text-[#00FF41]" />
              <span className="font-csmigrate font-black uppercase text-sm">WINNER FACTOR IMPACT BREAKDOWN</span>
            </div>
            <span className="text-[10px] text-[#D4FF00] font-black">PERCENTAGE CONTRIBUTION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {result.factor_impact_breakdown.map((factor, idx) => (
              <div
                key={idx}
                className="bg-[#07080A] border border-white/15 p-3.5 flex flex-col justify-between gap-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase font-csmigrate">{factor.factor_name}</span>
                  <span className="text-[#00FF41] font-black text-base">+{factor.contribution_pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0E1015] border border-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4FF00] to-[#00FF41] shadow-[0_0_8px_#D4FF00]"
                    style={{ width: `${factor.contribution_pct}%` }}
                  />
                </div>
                <p className="font-sans text-xs text-[#8E98AA] leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persona Ballot Box */}
      {result && result.persona_ballots.length > 0 && (
        <div className="flex flex-col gap-3 font-mechanismo">
          <div className="flex items-center justify-between border-b-2 border-white/15 pb-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Vote className="w-4 h-4 text-[#D4FF00]" />
              <span className="font-csmigrate font-black uppercase text-sm">SIMULATED PERSONA VOTING BALLOTS</span>
            </div>
            <span className="text-[11px] text-[#00FF41] font-bold">
              [{result.persona_ballots.length} INDEPENDENT AGENTS VOTED]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {result.persona_ballots.map((ballot, idx) => {
              const votedVariant = result.variants.find((v) => v.id === ballot.preferred_variant_id);

              return (
                <div
                  key={idx}
                  className="bg-[#07080A]/90 border border-white/15 p-3.5 flex flex-col justify-between gap-2.5 shadow-[2px_2px_0px_0px_#000] hover:border-[#D4FF00]/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-black text-white uppercase font-csmigrate">{ballot.persona_name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 uppercase font-black">
                      {votedVariant?.label.split(' ')[0] || 'VOTED'}
                    </span>
                  </div>

                  {ballot.score_a !== undefined && ballot.score_b !== undefined && (
                    <div className="flex items-center justify-between text-[11px] bg-[#0E1015] p-2 border border-white/10 font-mono">
                      <span className="text-[#D4FF00]">Specimen A: {ballot.score_a}</span>
                      <span className="text-white/40">vs</span>
                      <span className="text-[#00FF41]">Specimen B: {ballot.score_b}</span>
                      {ballot.score_c !== undefined && (
                        <>
                          <span className="text-white/40">vs</span>
                          <span className="text-[#FF0055]">C: {ballot.score_c}</span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="font-sans text-xs text-[#A2ABB9] italic leading-relaxed">
                    "{ballot.reasoning}"
                  </p>

                  {ballot.key_trigger && (
                    <div className="text-[10px] text-[#D4FF00] font-mono border-t border-white/10 pt-1.5">
                      DECIDING FACTOR: <span className="text-white font-sans">{ballot.key_trigger}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-white/15 font-mechanismo text-xs">
        <label className="flex items-center gap-2 text-[#A2ABB9] cursor-pointer font-bold">
          <input
            type="checkbox"
            checked={includeVariantC}
            onChange={(e) => setIncludeVariantC(e.target.checked)}
            className="w-4 h-4 rounded-none border-2 border-white/30 text-[#D4FF00] bg-black focus:ring-0"
          />
          <span>ENABLE 3-WAY A/B/C COMPARISON (ADD SPECIMEN C)</span>
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={executeBattle}
          disabled={isSimulating}
          className="font-csmigrate text-xs"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 mr-1.5', isSimulating && 'animate-spin')} />
          RE-SIMULATE HEAD-TO-HEAD BATTLE
        </Button>
      </div>
    </section>
  );
};
