import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PersonaReaction } from '../../api/types';

interface PersonaReactionCardProps {
  reaction: PersonaReaction | any;
}

export const PersonaReactionCard: React.FC<PersonaReactionCardProps> = ({ reaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reaction) return null;

  const getNum = (val: any) => {
    if (val === undefined || val === null) return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const watchProb = getNum(reaction.watch_probability);
  const shareProb = getNum(reaction.share_probability);
  const saveProb = getNum(reaction.save_probability);
  const compProb = getNum(reaction.completion_probability);

  const stopScrollProb = reaction.stop_scroll_probability !== undefined
    ? getNum(reaction.stop_scroll_probability)
    : typeof reaction.stop_scroll === 'number'
    ? getNum(reaction.stop_scroll)
    : reaction.stop_scroll ? 1 : 0;

  const stopScrollBool = typeof reaction.stop_scroll === 'boolean'
    ? reaction.stop_scroll
    : stopScrollProb >= 0.5;

  const personaViralityIndex = Math.round(
    (watchProb * 0.3 +
      shareProb * 0.3 +
      saveProb * 0.2 +
      compProb * 0.2) *
      100
  );

  const personaName = reaction.persona_name || reaction.name || 'Anonymous Persona';

  return (
    <div className="cyber-card corner-ticks p-4 sm:p-5 flex flex-col gap-3.5 text-left font-mechanismo">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#00FF41]/20 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black font-csmigrate text-white uppercase tracking-wider">
              {personaName}
            </span>
          </div>
          <span className="text-[10px] text-[#8E9E90] mt-0.5 font-bold">
            STATE: <span className="text-[#00F0FF]">{String(reaction.emotional_response || 'NEUTRAL EVALUATION').toUpperCase()}</span>
          </span>
        </div>

        {/* Persona Index Value */}
        <div className="flex items-baseline gap-1 bg-[#000000] px-2 py-1 border border-[#00FF41]/30 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-mechanismo font-black text-xl text-[#00FF41]">
            {personaViralityIndex}
          </span>
          <span className="font-mechanismo text-[10px] text-white/40 font-bold">/100</span>
        </div>
      </div>

      {/* Probability Ledger */}
      <div className="grid grid-cols-3 gap-2 bg-[#000000]/90 p-2.5 border border-[#00FF41]/15 text-[11px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col">
          <span className="text-[#526355] font-bold text-[10px]">STOP SCROLL</span>
          <span className={clsx('font-black tracking-wide', stopScrollBool ? 'text-[#00FF41]' : 'text-[#FF0055]')}>
            {stopScrollBool ? 'YES' : 'NO'} ({Math.round(stopScrollProb * 100)}%)
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#526355] font-bold text-[10px]">WATCH</span>
          <span className="font-black text-white">
            {Math.round(watchProb * 100)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#526355] font-bold text-[10px]">SHARE</span>
          <span className="font-black text-[#00F0FF]">
            {Math.round(shareProb * 100)}%
          </span>
        </div>
      </div>

      {/* Expand / Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-xs text-[#8E9E90] hover:text-[#00FF41] font-bold pt-1 cursor-pointer transition-colors"
      >
        <span>{isExpanded ? '[ HIDE DELIBERATION DOSSIER ]' : '[ INSPECT AGENT DELIBERATION ]'}</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#00FF41]" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Reasoning & Breakdown */}
      {isExpanded && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[#00FF41]/20 text-xs font-mechanismo">
          {reaction.reasoning && (
            <div className="p-3 bg-[#000000]/90 border-l-2 border-[#00FF41] italic text-[#FFFFFF] font-sans text-xs leading-relaxed">
              "{reaction.reasoning}"
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {reaction.strengths && reaction.strengths.length > 0 && (
              <div className="flex flex-col gap-1.5 bg-[#000000]/80 p-2.5 border border-[#00FF41]/20">
                <span className="text-[10px] text-[#00FF41] uppercase font-black tracking-wider">[+] RESONANCE</span>
                <ul className="text-xs text-[#8E9E90] font-sans space-y-1">
                  {reaction.strengths.map((str: string, idx: number) => (
                    <li key={idx} className="leading-snug">· {str}</li>
                  ))}
                </ul>
              </div>
            )}

            {reaction.weaknesses && reaction.weaknesses.length > 0 && (
              <div className="flex flex-col gap-1.5 bg-[#000000]/80 p-2.5 border border-[#FF0055]/30">
                <span className="text-[10px] text-[#FF0055] uppercase font-black tracking-wider">[-] FRICTION</span>
                <ul className="text-xs text-[#8E9E90] font-sans space-y-1">
                  {reaction.weaknesses.map((weak: string, idx: number) => (
                    <li key={idx} className="leading-snug">· {weak}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
