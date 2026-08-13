import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, Eye, Share2, MessageSquare, Bookmark, UserPlus, Heart } from 'lucide-react';
import { PersonaReaction } from '../../api/types';

interface AudienceMapProps {
  reactions: PersonaReaction[] | any[];
  totalPersonas: number;
  completedPersonas: number;
}

export const AudienceMap: React.FC<AudienceMapProps> = ({
  reactions = [],
  totalPersonas,
  completedPersonas,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getNum = (val: any) => {
    if (val === undefined || val === null) return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  // Compute composite persona reaction score
  const scored = (reactions || []).map((r, idx) => {
    const stopScrollProb = r.stop_scroll_probability !== undefined
      ? getNum(r.stop_scroll_probability)
      : typeof r.stop_scroll === 'number'
      ? getNum(r.stop_scroll)
      : r.stop_scroll ? 1 : 0;

    const stopScrollBool = typeof r.stop_scroll === 'boolean'
      ? r.stop_scroll
      : stopScrollProb >= 0.5;

    const watchProb = getNum(r.watch_probability);
    const shareProb = getNum(r.share_probability);
    const likeProb = getNum(r.like_probability);

    const avg = (stopScrollProb + watchProb + shareProb + likeProb) / 4;

    return {
      ...r,
      persona_id: r.persona_id || `p_${idx}`,
      persona_name: r.persona_name || r.name || `Persona 0${idx + 1}`,
      stop_scroll_probability: stopScrollProb,
      stop_scroll_bool: stopScrollBool,
      overallScore: Math.round(avg * 100),
      index: idx + 1,
    };
  });

  const sorted = [...scored].sort((a, b) => b.overallScore - a.overallScore);
  const pct = (v?: number) => (v !== undefined ? Math.round(v * 100) : 0);

  return (
    <section className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-6" aria-label="Audience response spectrum">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            04 // AUDIENCE OBSERVATION
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">MULTI-AGENT RESPONSE SPECTRUM</span>
        </div>
        <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/15 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-bold text-white">{completedPersonas || reactions.length} OF {totalPersonas || reactions.length} PERSONAS EVALUATED</span>
        </div>
      </div>

      {/* Ranked Audience Response Matrix */}
      <div className="flex flex-col gap-2.5 font-mechanismo">
        <div className="flex items-center justify-between text-xs text-[#8E98AA] pb-1 border-b border-white/10 uppercase font-bold">
          <span>RANK // AGENT PERSONA</span>
          <span>RESPONSE SPECTRUM (00–100)</span>
          <span>HOOK ACTION</span>
        </div>

        {sorted.map((persona, rk) => {
          const isExpanded = expandedId === persona.persona_id;
          const isHigh = persona.overallScore >= 70;
          const isLow = persona.overallScore < 45;

          return (
            <div key={persona.persona_id || rk} className="flex flex-col border-2 border-white/15 bg-[#07080A]/80 shadow-[2px_2px_0px_0px_#000]">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : persona.persona_id)}
                className="p-3 sm:p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#121620] transition-colors text-left"
                aria-expanded={isExpanded}
              >
                {/* Left Persona ID & Name */}
                <div className="flex items-center gap-3 min-w-0 w-48 sm:w-64">
                  <span className="text-xs text-[#D4FF00] font-black">[{String(rk + 1).padStart(2, '0')}]</span>
                  <div className="flex flex-col truncate">
                    <span className="font-black text-white text-xs sm:text-sm uppercase tracking-wide font-csmigrate truncate">
                      {persona.persona_name}
                    </span>
                    <span className="text-[10px] text-[#8E98AA] font-bold">
                      {persona.emotional_response || 'Neutral'}
                    </span>
                  </div>
                </div>

                {/* Center Linear Reaction Bar */}
                <div className="flex-1 max-w-xs sm:max-w-md hidden sm:flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-[#A2ABB9] font-bold">
                    <span>INDEX: <strong className="text-white">{persona.overallScore}/100</strong></span>
                    <span>WATCH: <strong className="text-[#00F0FF]">{pct(persona.watch_probability)}%</strong></span>
                  </div>
                  <div className="h-2 w-full bg-[#0E1015] border border-white/20 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-500',
                        isHigh ? 'bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]' : isLow ? 'bg-[#EF4444]' : 'bg-[#00F0FF]'
                      )}
                      style={{ width: `${persona.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Right Hook Conversion Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'text-[10px] px-2.5 py-1 font-black uppercase border-2 shadow-[2px_2px_0px_0px_#000]',
                      persona.stop_scroll_bool
                        ? 'text-[#060709] border-[#D4FF00] bg-[#D4FF00]'
                        : 'text-white border-[#EF4444] bg-[#EF4444]'
                    )}
                  >
                    {persona.stop_scroll_bool ? '[ SCROLL HALTED ]' : '[ SWIPE-AWAY ]'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#D4FF00]" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#07080A] flex flex-col gap-4">
                  {/* Persona Reasoning Quote */}
                  {persona.reasoning && (
                    <div className="p-3 bg-white/[0.02] border-l-2 border-[#D4FF00] text-xs sm:text-sm italic text-[#F4F6F8] font-sans">
                      "{persona.reasoning}"
                    </div>
                  )}

                  {/* 6 Key Probabilities Ledger */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <Eye className="w-3 h-3" />
                        <span>STOP SCROLL</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.stop_scroll_probability)}%</span>
                    </div>

                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <Eye className="w-3 h-3" />
                        <span>WATCH FULL</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.watch_probability)}%</span>
                    </div>

                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <Heart className="w-3 h-3" />
                        <span>LIKE RATE</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.like_probability)}%</span>
                    </div>

                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <MessageSquare className="w-3 h-3" />
                        <span>COMMENT</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.comment_probability)}%</span>
                    </div>

                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <Share2 className="w-3 h-3" />
                        <span>SHARE/DM</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.share_probability)}%</span>
                    </div>

                    <div className="p-2 border border-white/10 bg-white/[0.01] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#7E8798]">
                        <Bookmark className="w-3 h-3" />
                        <span>SAVE POST</span>
                      </div>
                      <span className="font-bold text-white text-sm">{pct(persona.save_probability)}%</span>
                    </div>
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {persona.strengths && persona.strengths.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[#D4FF00] font-bold uppercase">[+] Resonant Signals:</span>
                        <ul className="text-[#9DA7B8] font-sans space-y-0.5">
                          {persona.strengths.map((s: string, i: number) => (
                            <li key={i}>· {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {persona.weaknesses && persona.weaknesses.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase">[-] Friction Signals:</span>
                        <ul className="text-[#9DA7B8] font-sans space-y-0.5">
                          {persona.weaknesses.map((w: string, i: number) => (
                            <li key={i}>· {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
