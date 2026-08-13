import React, { useState } from 'react';
import { clsx } from 'clsx';
import { MessageSquare, Heart, ThumbsUp, CornerDownRight, Filter, Sparkles, Pin } from 'lucide-react';
import { PersonaReaction, Platform } from '../../api/types';

interface PersonaDebateStreamProps {
  reactions: PersonaReaction[] | any[];
  caption?: string;
  platform?: Platform;
}

interface SimulatedComment {
  id: string;
  personaName: string;
  avatarLabel: string;
  archetype: string;
  sentiment: 'positive' | 'critical' | 'neutral';
  commentText: string;
  likes: number;
  timeAgo: string;
  isPinned?: boolean;
  replyTo?: string;
  replies?: SimulatedComment[];
}

export const PersonaDebateStream: React.FC<PersonaDebateStreamProps> = ({
  reactions = [],
  caption = '',
  platform = 'tiktok',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'positive'>('all');
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [customLikes, setCustomLikes] = useState<Record<string, number>>({});

  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Generate realistic comments from each persona's actual reasoning and reaction signals
  const buildComments = (): SimulatedComment[] => {
    return reactions.map((r, idx) => {
      const pName = r.persona_name || r.name || `Persona 0${idx + 1}`;
      const reasoning = r.reasoning || '';
      const strength = Array.isArray(r.strengths) && r.strengths.length > 0 ? r.strengths[0] : '';
      const weakness = Array.isArray(r.weaknesses) && r.weaknesses.length > 0 ? r.weaknesses[0] : '';
      const stopScrollProb = Number(r.stop_scroll_probability ?? (typeof r.stop_scroll === 'number' ? r.stop_scroll : (r.stop_scroll ? 1 : 0)));
      const stopScroll = typeof r.stop_scroll === 'boolean' ? r.stop_scroll : stopScrollProb >= 0.5;
      const saveProb = Number(r.save_probability || 0);
      const likeProb = Number(r.like_probability || 0);
      const shareProb = Number(r.share_probability || 0);
      const watchProb = Number(r.watch_probability || 0);

      const isMetricsPositive = stopScroll && (watchProb >= 0.45 || saveProb >= 0.3 || likeProb >= 0.3 || shareProb >= 0.25);

      // 1. If LLM or simulation agent supplied an authentic simulated_comment, use it directly!
      let commentText = r.simulated_comment || '';

      // 2. Fallback dynamic synthesis if simulated_comment wasn't populated
      if (!commentText) {
        if (pName.toLowerCase().includes('gen-z') || pName.toLowerCase().includes('student')) {
          commentText = isMetricsPositive
            ? `bro cooked with this one ngl 🔥 ${strength ? `the part about "${strength.slice(0, 45)}" was spot on` : 'instant save for later'}`
            : `lost me in the first 2 seconds ngl... ${weakness ? weakness.toLowerCase() : 'pacing felt way too slow'}`;
        } else if (pName.toLowerCase().includes('skeptic') || pName.toLowerCase().includes('analyst')) {
          commentText = isMetricsPositive
            ? `Specific numbers and timeframe make this credible. ${strength || 'Solid proof of concept.'}`
            : `Where's the empirical backing for this claim? ${weakness || 'The hook makes an outsized promise without tangible data.'}`;
        } else if (pName.toLowerCase().includes('creator')) {
          commentText = `From a creator standpoint: ${strength ? `Great retention hook with ${strength.toLowerCase()}.` : 'Solid visual framing.'} ${weakness ? `Watch out though: ${weakness.toLowerCase()}` : 'The pacing curve holds strong.'}`;
        } else if (pName.toLowerCase().includes('niche') || pName.toLowerCase().includes('expert')) {
          commentText = isMetricsPositive
            ? `Accurate breakdown. ${strength || 'The distinction made here is often overlooked in mainstream advice.'} Worth bookmarking.`
            : `Oversimplified. ${weakness || 'You missed key domain nuance which undermines the premise.'}`;
        } else if (pName.toLowerCase().includes('casual') || pName.toLowerCase().includes('scroller')) {
          commentText = isMetricsPositive
            ? `Adding this to my saved bookmarks that I tell myself I'll check this weekend 😂`
            : `Scrolled right past after 2 seconds. Too much text to read on mobile.`;
        } else {
          commentText = reasoning ? `"${reasoning.slice(0, 120)}..."` : (strength || weakness || 'Evaluated specimen against audience heuristics.');
        }
      }

      // Check explicit text sentiment triggers
      const commentLower = commentText.toLowerCase();
      const hasPositiveCue = /bookmark|saved|saving|cooked|fire|🔥|😂|spot on|love|worth|great|good|clean|pedagogical|compelling|actionable|practical|useful|accurate|agree|solid|subscrib/.test(commentLower);
      const hasCriticalCue = /scrolled past|scrolled right past|lost me|too much text|too slow|where('s| is) the empirical|paywall|lacks|oversimplified|boring|unrealistic/.test(commentLower);

      let sentiment: 'positive' | 'critical' | 'neutral' = 'neutral';
      if (hasCriticalCue) {
        sentiment = 'critical';
      } else if (hasPositiveCue || isMetricsPositive) {
        sentiment = 'positive';
      } else if (!stopScroll) {
        sentiment = 'critical';
      } else {
        sentiment = 'positive';
      }

      // Add structured synthetic replies for rich conversational debate
      const replies: SimulatedComment[] = [];
      if (idx === 0 && reactions.length > 1) {
        const otherP = reactions[1];
        const otherName = otherP.persona_name || otherP.name || 'Counter Agent';
        replies.push({
          id: `reply-${idx}-1`,
          personaName: otherName,
          avatarLabel: otherName.slice(0, 2).toUpperCase(),
          archetype: 'Counter-Perspective',
          sentiment: otherP.stop_scroll ? 'positive' : 'critical',
          commentText: otherP.stop_scroll
            ? `@${pName} Actually disagreed with you on drop-off. The value proposition is clear right upfront.`
            : `@${pName} 100% agreed. Needs to get straight to the transformation before the 3s mark.`,
          likes: Math.floor(Math.random() * 12) + 2,
          timeAgo: '1m ago',
        });
      }

      return {
        id: `comment-${idx}-${r.persona_id || idx}`,
        personaName: pName,
        avatarLabel: pName.slice(0, 2).toUpperCase(),
        archetype: r.persona_role || r.archetype || 'Audience Member',
        sentiment,
        commentText,
        likes: Math.floor((watchProb + shareProb) * 24) + 3,
        timeAgo: `${(idx + 1) * 2}m ago`,
        isPinned: idx === 0 && isMetricsPositive,
        replies: replies.length > 0 ? replies : undefined,
      };
    });
  };

  const comments = buildComments();

  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'positive') return c.sentiment === 'positive';
    if (activeFilter === 'critical') return c.sentiment === 'critical';
    return true;
  });

  const toggleLike = (id: string, baseLikes: number) => {
    setLikedComments((prev) => {
      const isCurrentlyLiked = !!prev[id];
      const newStatus = !isCurrentlyLiked;
      setCustomLikes((likePrev) => ({
        ...likePrev,
        [id]: (likePrev[id] ?? baseLikes) + (newStatus ? 1 : -1),
      }));
      return { ...prev, [id]: newStatus };
    });
  };

  const getLikeCount = (id: string, baseLikes: number) => {
    return customLikes[id] !== undefined ? customLikes[id] : baseLikes;
  };

  return (
    <section className="w-full cyber-card corner-ticks p-6 sm:p-8 flex flex-col gap-6 text-left" aria-label="Persona comment debate stream">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#00FF41]/20 pb-3 font-mechanismo text-[11px] text-[#8E9E90] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-black bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40 shadow-[0_0_6px_rgba(0,255,65,0.2)]">
            04C // AUDIENCE DEBATE STREAM
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/90 font-bold">SYNTHETIC SOCIAL FEED & COMMENT CONVERSATION</span>
        </div>
        <div className="flex items-center gap-2 bg-[#000000] px-2 py-1 border border-[#00FF41]/30 shadow-[2px_2px_0px_0px_#000]">
          <MessageSquare className="w-3.5 h-3.5 text-[#00FF41]" />
          <span className="font-bold text-white">{comments.length} AGENTS DELIBERATING</span>
        </div>
      </div>

      {/* Filter Tabs & Platform Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mechanismo text-xs">
        <div className="flex items-center gap-1.5 bg-[#000000] p-1 border-2 border-[#00FF41]/30 shadow-[2px_2px_0px_0px_#000]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={clsx(
              'px-3 py-1 uppercase text-[11px] font-bold transition-all cursor-pointer font-csmigrate',
              activeFilter === 'all'
                ? 'bg-[#00FF41] text-[#000000] shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E9E90] hover:text-white'
            )}
          >
            ALL DELIBERATION ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('positive')}
            className={clsx(
              'px-3 py-1 uppercase text-[11px] font-bold transition-all cursor-pointer font-csmigrate',
              activeFilter === 'positive'
                ? 'bg-[#00FF41] text-[#000000] shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E9E90] hover:text-white'
            )}
          >
            [+] RESONANCE
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={clsx(
              'px-3 py-1 uppercase text-[11px] font-bold transition-all cursor-pointer font-csmigrate',
              activeFilter === 'critical'
                ? 'bg-[#FF0055] text-white shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E9E90] hover:text-white'
            )}
          >
            [-] FRICTION & SKEPTICISM
          </button>
        </div>

        <span className="text-[11px] text-[#8E9E90] uppercase font-bold">
          SIMULATED FEED FOR: <strong className="text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 border border-[#00F0FF]/40">{platform.toUpperCase()}</strong>
        </span>
      </div>

      {/* Comment Stream List */}
      <div className="flex flex-col gap-3.5 font-mechanismo" role="feed" aria-label="Persona comments">
        {filteredComments.map((c) => {
          const isLiked = !!likedComments[c.id];
          const likesCount = getLikeCount(c.id, c.likes);

          return (
            <div
              key={c.id}
              className={clsx(
                'border-2 p-4 sm:p-5 flex flex-col gap-3 transition-all shadow-[3px_3px_0px_0px_#000]',
                c.isPinned
                  ? 'bg-[#080D09] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)]'
                  : 'bg-[#000000]/95 border-[#00FF41]/20 hover:border-[#00FF41]/60'
              )}
            >
              {/* Top Row: Avatar, Persona, Tag, Timestamp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#050805] border-2 border-[#00FF41]/40 flex items-center justify-center font-black font-csmigrate text-xs text-[#00FF41] shadow-[2px_2px_0px_0px_#000]">
                    {c.avatarLabel}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white uppercase font-csmigrate tracking-wide">
                      {c.personaName}
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] px-2 py-0.5 uppercase font-bold border',
                        c.sentiment === 'positive'
                          ? 'border-[#00FF41]/60 text-[#00FF41] bg-[#00FF41]/10'
                          : 'border-[#FF0055]/60 text-[#FF0055] bg-[#FF0055]/10'
                      )}
                    >
                      {c.sentiment === 'positive' ? 'RESONANT' : 'FRICTION'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#526355]">
                  {c.isPinned && (
                    <span className="flex items-center gap-1 text-[#00FF41] font-bold">
                      <Pin className="w-3 h-3" /> PINNED HIGH-SIGNAL
                    </span>
                  )}
                  <span>{c.timeAgo}</span>
                </div>
              </div>

              {/* Comment Content Text */}
              <div className="font-sans text-xs sm:text-sm text-[#E2E6EC] pl-10 leading-relaxed">
                {c.commentText}
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 pl-10 text-[10px] text-[#8E9E90] pt-1">
                <button
                  type="button"
                  onClick={() => toggleLike(c.id, c.likes)}
                  className={clsx(
                    'flex items-center gap-1.5 cursor-pointer transition-colors',
                    isLiked ? 'text-[#00FF41] font-bold' : 'hover:text-white'
                  )}
                  aria-label="Like comment"
                >
                  <Heart className={clsx('w-3 h-3', isLiked && 'fill-[#00FF41] text-[#00FF41]')} />
                  <span>{likesCount}</span>
                </button>

                <span className="text-white/20">·</span>
                <span className="uppercase text-[9px] text-[#526355]">SIMULATED AGENT RESPONSE</span>
              </div>

              {/* Threaded Nested Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-10 mt-2 pl-3 border-l-2 border-[#00FF41]/20 flex flex-col gap-2.5 pt-2">
                  {c.replies.map((reply) => {
                    const replyLiked = !!likedComments[reply.id];
                    const replyLikes = getLikeCount(reply.id, reply.likes);

                    return (
                      <div
                        key={reply.id}
                        className="bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3 h-3 text-[#8E9E90]" />
                            <span className="font-bold text-white uppercase text-[11px]">
                              {reply.personaName}
                            </span>
                            <span className="text-[9px] text-[#526355]">[{reply.archetype}]</span>
                          </div>
                          <span className="text-[10px] text-[#526355]">{reply.timeAgo}</span>
                        </div>

                        <p className="font-sans text-xs text-[#8E9E90] pl-5 leading-relaxed">
                          {reply.commentText}
                        </p>

                        <div className="flex items-center gap-2 pl-5 pt-1 text-[10px] text-[#8E9E90]">
                          <button
                            type="button"
                            onClick={() => toggleLike(reply.id, reply.likes)}
                            className={clsx(
                              'flex items-center gap-1 cursor-pointer transition-colors',
                              replyLiked ? 'text-[#00FF41] font-bold' : 'hover:text-white'
                            )}
                          >
                            <Heart className={clsx('w-2.5 h-2.5', replyLiked && 'fill-[#00FF41] text-[#00FF41]')} />
                            <span>{replyLikes}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
