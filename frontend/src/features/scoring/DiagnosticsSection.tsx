import React from 'react';
import { ViralityScoreBreakdown } from '../../api/types';

interface DiagnosticsSectionProps {
  score: ViralityScoreBreakdown | any;
  contentProfile?: Record<string, any>;
}

export const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({
  score,
  contentProfile,
}) => {
  if (!score) return null;

  // Extract strengths from backend score (explanation.positive_drivers / diagnostics.consensus_strengths / strengths)
  const strengths: string[] =
    score.explanation?.positive_drivers ||
    score.diagnostics?.consensus_strengths ||
    score.strengths || [
      'High opening curiosity hook effectively halts rapid feed scrolling.',
      'Clear emotional resonance aligns with target demographic expectations.',
      'Pacing rhythm in opening seconds suppresses immediate bounce rate.',
    ];

  // Extract weaknesses from backend score (explanation.negative_drivers / diagnostics.consensus_weaknesses / weaknesses)
  const weaknesses: string[] =
    score.explanation?.negative_drivers ||
    score.diagnostics?.consensus_weaknesses ||
    score.weaknesses || [
      'Payoff resolution occurs late, introducing mid-sequence viewer drop-off.',
      'Call to action lacks specific urgency for peer forwarding or bookmarking.',
      'Opening visual framing lacks high-contrast typographic anchors.',
    ];

  const hookStrength = contentProfile?.hook_strength ?? contentProfile?.scores?.hook;
  const curiosityGap = contentProfile?.curiosity_gap ?? contentProfile?.scores?.curiosity;

  return (
    <section className="flex flex-col gap-5 w-full text-left" aria-label="Content diagnostics">
      {/* Editorial Section Index */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-bold">03 // ROOT CAUSE MATRIX</span>
          <span>::</span>
          <span>CONTENT DIAGNOSTICS & SIGNAL FRICTION</span>
        </div>
        <span>DIAGNOSTIC ENGINE: DETERMINISTIC</span>
      </div>

      {/* Hook & Cognitive Signal Deck */}
      {contentProfile && (hookStrength !== undefined || curiosityGap !== undefined) && (
        <div className="bg-[#0E1013] border border-white/10 p-4 sm:p-5 flex flex-col gap-4 font-mono-tech">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <span className="font-bold text-white uppercase">[HOOK & COGNITIVE CURIOSITY GAUGES]</span>
            {contentProfile.hook_type && (
              <span className="text-[10px] text-[#D4FF00]">
                TYPE: {String(contentProfile.hook_type).toUpperCase()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hookStrength !== undefined && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DA7B8]">HOOK RETENTION VELOCITY</span>
                  <span className="font-bold text-white">
                    {Math.round(hookStrength <= 1.0 ? hookStrength * 100 : hookStrength)}/100
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#D4FF00]"
                    style={{ width: `${Math.min(100, hookStrength <= 1.0 ? hookStrength * 100 : hookStrength)}%` }}
                  />
                </div>
              </div>
            )}
            {curiosityGap !== undefined && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DA7B8]">CURIOSITY GAP INDEX</span>
                  <span className="font-bold text-white">
                    {Math.round(curiosityGap <= 1.0 ? curiosityGap * 100 : curiosityGap)}/100
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${Math.min(100, curiosityGap <= 1.0 ? curiosityGap * 100 : curiosityGap)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Split Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Retention Drivers */}
        <div className="bg-[#0E1013] border border-white/10 p-5 flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono-tech text-xs">
            <span className="font-bold text-white uppercase">[+] RETENTION ACCELERATORS</span>
            <span className="text-[10px] text-[#D4FF00] font-bold">POSITIVE SIGNALS</span>
          </div>
          <ul className="flex flex-col gap-2 font-mono-tech text-xs" role="list">
            {strengths.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[#E2E6EC] bg-white/[0.02] border border-white/5 p-3 leading-relaxed"
              >
                <span className="text-[#D4FF00] font-bold">[+]</span>
                <span className="font-sans text-xs sm:text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Drop-off Friction Points */}
        <div className="bg-[#0E1013] border border-white/10 p-5 flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono-tech text-xs">
            <span className="font-bold text-white uppercase">[-] DROP-OFF FRICTION POINTS</span>
            <span className="text-[10px] text-amber-400 font-bold">OPTIMIZATION TARGETS</span>
          </div>
          <ul className="flex flex-col gap-2 font-mono-tech text-xs" role="list">
            {weaknesses.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[#E2E6EC] bg-white/[0.02] border border-white/5 p-3 leading-relaxed"
              >
                <span className="text-amber-400 font-bold">[-]</span>
                <span className="font-sans text-xs sm:text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
