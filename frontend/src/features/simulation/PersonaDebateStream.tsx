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
        const snippet = caption ? `"${caption.slice(0, 40)}..."` : '';
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
      let replies: SimulatedComment[] = [];
      const firstPersonaFirstName = (reactions[0]?.persona_name || 'Creator').split(' ')[0];

      if (idx === 0 && reactions.length > 1) {
        replies.push({
          id: `reply_${idx}_1`,
          personaName: reactions[1].persona_name || 'Content Creator',
          avatarLabel: 'CC',
          archetype: 'PEER CREATOR',
          sentiment: 'neutral',
          commentText: `@${firstPersonaFirstName} Exactly why the 3-second hook structure matters so much on ${platform.toUpperCase()}.`,
          likes: 24,
          timeAgo: '4m ago',
        });
      } else if (pName.toLowerCase().includes('skeptic') && reactions.length > 2) {
        replies.push({
          id: `reply_${idx}_2`,
          personaName: 'Gen-Z Student',
          avatarLabel: 'GZ',
          archetype: 'SPEED FILTER',
          sentiment: 'positive',
          commentText: `@${pName.split(' ')[0]} bro chill not everything needs a 40-page whitepaper it's a short form post 😭`,
          likes: 58,
          timeAgo: '1m ago',
        });
      } else if (pName.toLowerCase().includes('creator') && reactions.length > 3) {
        replies.push({
          id: `reply_${idx}_3`,
          personaName: 'Niche Domain Expert',
          avatarLabel: 'NE',
          archetype: 'DOMAIN EXPERT',
          sentiment: 'neutral',
          commentText: `@${pName.split(' ')[0]} Agree on the pacing, but creators should make sure the educational payoff matches the initial promise.`,
          likes: 31,
          timeAgo: '2m ago',
        });
      }

      return {
        id: r.persona_id || `comment_${idx}`,
        personaName: pName,
        avatarLabel: pName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        archetype: r.archetype || `AGENT ${String(idx + 1).padStart(2, '0')}`,
        sentiment,
        commentText,
        likes: Math.floor(Math.random() * 80) + 12,
        timeAgo: `${(idx + 1) * 3}m ago`,
        isPinned: idx === 2, // Pin one high-signal comment
        replies,
      };
    });
  };

  const comments = buildComments();

  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'positive') return c.sentiment === 'positive';
    if (activeFilter === 'critical') return c.sentiment === 'critical';
    return true;
  });

  const toggleLike = (id: string, initialLikes: number) => {
    const isLiked = !!likedComments[id];
    setLikedComments((prev) => ({ ...prev, [id]: !isLiked }));
    setCustomLikes((prev) => ({
      ...prev,
      [id]: (prev[id] !== undefined ? prev[id] : initialLikes) + (isLiked ? -1 : 1),
    }));
  };

  const getLikeCount = (id: string, initial: number) => {
    return customLikes[id] !== undefined ? customLikes[id] : initial;
  };

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-6"
      aria-label="Simulated Audience Debate & Comment Thread"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            04C // AUDIENCE DEBATE STREAM
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/80 font-bold">SYNTHETIC SOCIAL FEED & COMMENT CONVERSATION</span>
        </div>
        <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/15 shadow-[2px_2px_0px_0px_#000]">
          <MessageSquare className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span className="font-bold text-white">{comments.length} AGENTS DELIBERATING</span>
        </div>
      </div>

      {/* Filter Tabs & Platform Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mechanismo text-xs">
        <div className="flex items-center gap-1.5 bg-[#07080A] p-1 border-2 border-white/15 shadow-[2px_2px_0px_0px_#000]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={clsx(
              'px-3 py-1 uppercase text-[11px] font-bold transition-all cursor-pointer font-csmigrate',
              activeFilter === 'all'
                ? 'bg-[#D4FF00] text-[#060709] shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E98AA] hover:text-white'
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
                ? 'bg-[#D4FF00] text-[#060709] shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E98AA] hover:text-white'
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
                ? 'bg-[#EF4444] text-white shadow-[1px_1px_0px_0px_#000]'
                : 'text-[#8E98AA] hover:text-white'
            )}
          >
            [-] FRICTION & SKEPTICISM
          </button>
        </div>

        <span className="text-[11px] text-[#8E98AA] uppercase font-bold">
          SIMULATED FEED FOR: <strong className="text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40">{platform.toUpperCase()}</strong>
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
                  ? 'bg-[#0D1017] border-[#D4FF00] shadow-[3px_3px_0px_0px_#D4FF00]'
                  : 'bg-[#07080A]/90 border-white/15 hover:border-[#D4FF00]/60'
              )}
            >
              {/* Top Row: Avatar, Persona, Tag, Timestamp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#11141B] border-2 border-white/20 flex items-center justify-center font-black font-csmigrate text-xs text-[#D4FF00] shadow-[2px_2px_0px_0px_#000]">
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
                          ? 'border-[#D4FF00]/60 text-[#D4FF00] bg-[#D4FF00]/10'
                          : 'border-[#EF4444]/60 text-[#EF4444] bg-[#EF4444]/10'
                      )}
                    >
                      {c.sentiment === 'positive' ? 'RESONANT' : 'FRICTION'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#5B6474]">
                  {c.isPinned && (
                    <span className="flex items-center gap-1 text-[#D4FF00] font-bold">
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
              <div className="flex items-center gap-4 pl-10 text-[10px] text-[#7E8798] pt-1">
                <button
                  type="button"
                  onClick={() => toggleLike(c.id, c.likes)}
                  className={clsx(
                    'flex items-center gap-1.5 cursor-pointer transition-colors',
                    isLiked ? 'text-[#D4FF00] font-bold' : 'hover:text-white'
                  )}
                  aria-label="Like comment"
                >
                  <Heart className={clsx('w-3 h-3', isLiked && 'fill-[#D4FF00] text-[#D4FF00]')} />
                  <span>{likesCount}</span>
                </button>

                <span className="text-white/20">·</span>
                <span className="uppercase text-[9px] text-[#5B6474]">SIMULATED AGENT RESPONSE</span>
              </div>

              {/* Threaded Nested Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-10 mt-2 pl-3 border-l-2 border-white/10 flex flex-col gap-2.5 pt-2">
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
                            <CornerDownRight className="w-3 h-3 text-[#7E8798]" />
                            <span className="font-bold text-white uppercase text-[11px]">
                              {reply.personaName}
                            </span>
                            <span className="text-[9px] text-[#5B6474]">[{reply.archetype}]</span>
                          </div>
                          <span className="text-[10px] text-[#5B6474]">{reply.timeAgo}</span>
                        </div>

                        <p className="font-sans text-xs text-[#9DA7B8] pl-5 leading-relaxed">
                          {reply.commentText}
                        </p>

                        <div className="flex items-center gap-2 pl-5 pt-1 text-[10px] text-[#7E8798]">
                          <button
                            type="button"
                            onClick={() => toggleLike(reply.id, reply.likes)}
                            className={clsx(
                              'flex items-center gap-1 cursor-pointer transition-colors',
                              replyLiked ? 'text-[#D4FF00] font-bold' : 'hover:text-white'
                            )}
                          >
                            <Heart className={clsx('w-2.5 h-2.5', replyLiked && 'fill-[#D4FF00] text-[#D4FF00]')} />
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
