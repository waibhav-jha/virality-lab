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
    <div className="bg-[#0E1013] border border-white/10 p-4 sm:p-5 flex flex-col gap-3.5 text-left font-mono-tech">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {personaName}
            </span>
          </div>
          <span className="text-[10px] text-[#7E8798] mt-0.5">
            STATE: {String(reaction.emotional_response || 'NEUTRAL EVALUATION').toUpperCase()}
          </span>
        </div>

        {/* Persona Index Value */}
        <div className="flex items-baseline gap-1">
          <span className="font-display font-black text-lg sm:text-xl text-[#D4FF00]">
            {personaViralityIndex}
          </span>
          <span className="text-[9px] text-white/40">/100</span>
        </div>
      </div>

      {/* Probability Ledger */}
      <div className="grid grid-cols-3 gap-2 bg-white/[0.02] p-2 border border-white/5 text-[10px]">
        <div className="flex flex-col">
          <span className="text-[#5B6474]">STOP SCROLL</span>
          <span className={clsx('font-bold', stopScrollBool ? 'text-[#D4FF00]' : 'text-red-400')}>
            {stopScrollBool ? 'YES' : 'NO'} ({Math.round(stopScrollProb * 100)}%)
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#5B6474]">WATCH</span>
          <span className="font-bold text-white">
            {Math.round(watchProb * 100)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#5B6474]">SHARE</span>
          <span className="font-bold text-white">
            {Math.round(shareProb * 100)}%
          </span>
        </div>
      </div>

      {/* Expand / Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-[11px] text-[#9DA7B8] hover:text-white pt-1 cursor-pointer"
      >
        <span>{isExpanded ? '[ HIDE DELIBERATION DOSSIER ]' : '[ INSPECT AGENT DELIBERATION ]'}</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Reasoning & Breakdown */}
      {isExpanded && (
        <div className="flex flex-col gap-3 pt-2 border-t border-white/10 text-xs font-mono-tech">
          {reaction.reasoning && (
            <div className="p-2.5 bg-white/[0.02] border-l border-[#D4FF00] italic text-[#E2E6EC] font-sans text-xs">
              "{reaction.reasoning}"
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {reaction.strengths && reaction.strengths.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#D4FF00] uppercase font-bold">[+] RESONANCE</span>
                <ul className="text-xs text-[#9DA7B8] font-sans space-y-1">
                  {reaction.strengths.map((str: string, idx: number) => (
                    <li key={idx}>· {str}</li>
                  ))}
                </ul>
              </div>
            )}

            {reaction.weaknesses && reaction.weaknesses.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-amber-400 uppercase font-bold">[-] FRICTION</span>
                <ul className="text-xs text-[#9DA7B8] font-sans space-y-1">
                  {reaction.weaknesses.map((weak: string, idx: number) => (
                    <li key={idx}>· {weak}</li>
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
