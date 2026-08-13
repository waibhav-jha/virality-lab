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
      className="w-full bg-[#0E1013] border border-white/15 p-6 sm:p-8 text-left flex flex-col gap-8 corner-ticks"
      aria-label="Multi-Variant A/B Testing Arena"
    >
      {/* Section Masthead */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-bold">04B // LIVE A/B/C HEAD-TO-HEAD ARENA</span>
          <span>::</span>
          <span>AUDIENCE BALLOT & MULTI-VARIANT DELIBERATION</span>
        </div>
        <div className="flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>{result?.variants.length || 2} SPECIMENS COMPETING</span>
        </div>
      </div>

      {/* Arena Overview Banner */}
      {result && winner && (
        <div className="bg-gradient-to-r from-[#D4FF00]/10 via-black/60 to-transparent border border-[#D4FF00]/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#D4FF00]/20 border border-[#D4FF00]/50 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-[#D4FF00]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#D4FF00] uppercase font-bold tracking-wider">
                <span>HEAD-TO-HEAD ARENA WINNER</span>
                <span>·</span>
                <span>+{result.win_margin}% AUDIENCE MARGIN</span>
              </div>
              <p className="font-sans text-sm text-white font-semibold mt-0.5">
                {winner.label} ({winner.vote_percentage}% of Segment Votes)
              </p>
              <p className="font-sans text-xs text-[#9DA7B8] mt-1">{result.executive_summary}</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onApplyVariant(winner.caption)}
            className="shrink-0 font-mono-tech text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            PROMOTE WINNER TO STUDIO
          </Button>
        </div>
      )}

      {/* Head-to-Head Audience Preference Distribution Bar */}
      {result && (
        <div className="flex flex-col gap-2 font-mono-tech">
          <div className="flex justify-between text-xs text-[#9DA7B8]">
            <span className="text-[#D4FF00] font-bold">
              SPECIMEN A: {result.variants[0]?.vote_percentage || 0}%
            </span>
            <span className="text-white font-bold">
              SPECIMEN B: {result.variants[1]?.vote_percentage || 0}%
            </span>
            {result.variants[2] && (
              <span className="text-amber-400 font-bold">
                SPECIMEN C: {result.variants[2]?.vote_percentage || 0}%
              </span>
            )}
          </div>

          <div className="w-full h-3 bg-black/60 border border-white/10 flex overflow-hidden">
            <div
              style={{ width: `${result.variants[0]?.vote_percentage || 0}%` }}
              className="h-full bg-[#D4FF00] transition-all duration-500"
              title={`Specimen A: ${result.variants[0]?.vote_percentage || 0}%`}
            />
            <div
              style={{ width: `${result.variants[1]?.vote_percentage || 0}%` }}
              className="h-full bg-cyan-400 transition-all duration-500"
              title={`Specimen B: ${result.variants[1]?.vote_percentage || 0}%`}
            />
            {result.variants[2] && (
              <div
                style={{ width: `${result.variants[2]?.vote_percentage || 0}%` }}
                className="h-full bg-amber-400 transition-all duration-500"
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
            ? 'border-[#D4FF00]/60 bg-white/[0.03]'
            : 'border-white/10 bg-black/40';

          return (
            <div
              key={v.id}
              className={clsx(
                'border p-5 flex flex-col justify-between gap-4 transition-all relative',
                borderColor
              )}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2 font-mono-tech text-[10px]">
                  <span
                    className={clsx(
                      'font-bold px-2 py-0.5 uppercase border',
                      isWinner
                        ? 'border-[#D4FF00]/40 bg-[#D4FF00]/10 text-[#D4FF00]'
                        : 'border-white/20 text-[#7E8798]'
                    )}
                  >
                    {v.label}
                  </span>
                  {isWinner && (
                    <span className="flex items-center gap-1 text-[#D4FF00] font-bold">
                      <Trophy className="w-3 h-3" /> BEST PERFORMER
                    </span>
                  )}
                </div>

                {/* Score & Vote Metric */}
                <div className="flex items-baseline justify-between mt-3 pb-3 border-b border-white/10">
                  <div>
                    <span className="font-mono-tech text-[10px] text-[#7E8798] uppercase block">
                      SCORE
                    </span>
                    <span
                      className={clsx(
                        'text-2xl font-bold font-mono-tech',
                        isWinner ? 'text-[#D4FF00]' : 'text-white'
                      )}
                    >
                      {v.score.calibrated_virality_score}
                      <span className="text-xs text-[#5B6474]">/100</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono-tech text-[10px] text-[#7E8798] uppercase block">
                      AUDIENCE VOTE
                    </span>
                    <span className="text-xl font-bold font-mono-tech text-white">
                      {v.vote_percentage}%{' '}
                      <span className="text-xs text-[#7E8798]">({v.vote_count} votes)</span>
                    </span>
                  </div>
                </div>

                {/* Strategic Advantage */}
                <div className="mt-3 font-mono-tech text-[11px] text-[#9DA7B8]">
                  <span className="text-[#5B6474] uppercase block text-[9px]">KEY ADVANTAGE:</span>
                  <span className="text-[#D4FF00]">{v.key_advantage}</span>
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 font-mono-tech text-[10px] bg-black/40 p-2 border border-white/5">
                  <div>
                    <span className="text-[#5B6474] block">RETENTION</span>
                    <span className="text-white font-bold">{v.score.retention_score}</span>
                  </div>
                  <div>
                    <span className="text-[#5B6474] block">ENGAGEMENT</span>
                    <span className="text-white font-bold">{v.score.engagement_score}</span>
                  </div>
                  <div>
                    <span className="text-[#5B6474] block">SHAREABILITY</span>
                    <span className="text-white font-bold">{v.score.shareability_score}</span>
                  </div>
                </div>

                {/* Caption Text Area / Editor */}
                <div className="mt-4">
                  <span className="font-mono-tech text-[9px] text-[#5B6474] uppercase block mb-1">
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
                    className="w-full bg-black/60 border border-white/10 p-2.5 font-sans text-xs text-white focus:border-[#D4FF00] focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => onApplyVariant(v.caption)}
                className={clsx(
                  'w-full py-2 font-mono-tech text-xs uppercase font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                  isWinner
                    ? 'bg-[#D4FF00] text-black border-[#D4FF00] hover:bg-[#bce300]'
                    : 'bg-white/5 text-[#9DA7B8] border-white/10 hover:border-white/30 hover:text-white'
                )}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                USE THIS SPECIMEN
              </button>
            </div>
          );
        })}
      </div>

      {/* Persona Ballot Box */}
      {result && result.persona_ballots.length > 0 && (
        <div className="flex flex-col gap-3 font-mono-tech">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Vote className="w-4 h-4 text-[#D4FF00]" />
              <span>SIMULATED PERSONA VOTING BALLOTS</span>
            </div>
            <span className="text-[10px] text-[#5B6474]">
              {result.persona_ballots.length} INDEPENDENT AGENTS VOTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.persona_ballots.map((ballot, idx) => {
              const votedVariant = result.variants.find((v) => v.id === ballot.preferred_variant_id);

              return (
                <div
                  key={idx}
                  className="bg-white/[0.01] border border-white/10 p-3 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white uppercase">{ballot.persona_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30 uppercase font-bold">
                      {votedVariant?.label.split(' ')[0] || 'VOTED'}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#9DA7B8] italic leading-relaxed">
                    "{ballot.reasoning}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10 font-mono-tech text-xs">
        <label className="flex items-center gap-2 text-[#9DA7B8] cursor-pointer">
          <input
            type="checkbox"
            checked={includeVariantC}
            onChange={(e) => setIncludeVariantC(e.target.checked)}
            className="rounded border-white/20 text-[#D4FF00] focus:ring-0"
          />
          <span>ENABLE 3-WAY A/B/C COMPARISON (ADD SPECIMEN C)</span>
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={executeBattle}
          disabled={isSimulating}
          className="font-mono-tech text-xs"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 mr-1.5', isSimulating && 'animate-spin')} />
          RE-SIMULATE HEAD-TO-HEAD BATTLE
        </Button>
      </div>
    </section>
  );
};
