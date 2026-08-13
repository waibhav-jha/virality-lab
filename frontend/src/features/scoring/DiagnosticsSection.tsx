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
      {/* Cyber Section Index */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-2 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            03 // ROOT CAUSE MATRIX
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">CONTENT DIAGNOSTICS & SIGNAL FRICTION</span>
        </div>
        <span className="text-[#00FF41] font-bold">[DIAGNOSTIC ENGINE: DETERMINISTIC]</span>
      </div>

      {/* Hook & Cognitive Signal Deck */}
      {contentProfile && (hookStrength !== undefined || curiosityGap !== undefined) && (
        <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mechanismo">
          <div className="flex items-center justify-between border-b border-white/15 pb-2 text-xs">
            <span className="font-black text-white uppercase font-csmigrate">[HOOK & COGNITIVE CURIOSITY GAUGES]</span>
            {contentProfile.hook_type && (
              <span className="text-[11px] text-[#060709] bg-[#D4FF00] px-2 py-0.5 font-bold border border-[#D4FF00]">
                TYPE: {String(contentProfile.hook_type).toUpperCase()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hookStrength !== undefined && (
              <div className="flex flex-col gap-1.5 bg-[#07080A]/60 p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A2ABB9] font-bold">HOOK RETENTION VELOCITY</span>
                  <span className="font-black text-[#D4FF00]">
                    {Math.round(hookStrength <= 1.0 ? hookStrength * 100 : hookStrength)}/100
                  </span>
                </div>
                <div className="h-2 bg-[#0E1015] border border-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4FF00] to-[#E2FF44] shadow-[0_0_8px_#D4FF00]"
                    style={{ width: `${Math.min(100, hookStrength <= 1.0 ? hookStrength * 100 : hookStrength)}%` }}
                  />
                </div>
              </div>
            )}
            {curiosityGap !== undefined && (
              <div className="flex flex-col gap-1.5 bg-[#07080A]/60 p-3 border border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A2ABB9] font-bold">CURIOSITY GAP INDEX</span>
                  <span className="font-black text-[#00FF41]">
                    {Math.round(curiosityGap <= 1.0 ? curiosityGap * 100 : curiosityGap)}/100
                  </span>
                </div>
                <div className="h-2 bg-[#0E1015] border border-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF41] to-white shadow-[0_0_8px_#00FF41]"
                    style={{ width: `${Math.min(100, curiosityGap <= 1.0 ? curiosityGap * 100 : curiosityGap)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Split Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Retention Drivers */}
        <div className="cyber-card corner-ticks p-5 flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between border-b border-white/15 pb-2 font-mechanismo text-xs">
            <span className="font-black text-[#D4FF00] font-csmigrate text-sm tracking-wide uppercase">[+] RETENTION ACCELERATORS</span>
            <span className="text-[10px] text-[#060709] bg-[#D4FF00] px-1.5 py-0.5 font-black uppercase">POSITIVE</span>
          </div>
          <ul className="flex flex-col gap-2.5 font-mechanismo text-xs" role="list">
            {strengths.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[#E2E6EC] bg-[#07080A]/80 border border-white/10 hover:border-[#D4FF00]/60 p-3 leading-relaxed shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                <span className="text-[#D4FF00] font-black shrink-0">[+]</span>
                <span className="font-sans text-xs sm:text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Drop-off Friction Points */}
        <div className="cyber-card corner-ticks p-5 flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between border-b border-white/15 pb-2 font-mechanismo text-xs">
            <span className="font-black text-[#EF4444] font-csmigrate text-sm tracking-wide uppercase">[-] DROP-OFF FRICTION POINTS</span>
            <span className="text-[10px] text-white bg-[#EF4444] px-1.5 py-0.5 font-black uppercase">ATTENTION</span>
          </div>
          <ul className="flex flex-col gap-2.5 font-mechanismo text-xs" role="list">
            {weaknesses.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[#E2E6EC] bg-[#07080A]/80 border border-white/10 hover:border-[#EF4444]/60 p-3 leading-relaxed shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                <span className="text-[#EF4444] font-black shrink-0">[-]</span>
                <span className="font-sans text-xs sm:text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
