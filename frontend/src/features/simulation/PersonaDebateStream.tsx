import React, { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  MessageSquare,
  Heart,
  CornerDownRight,
  Sparkles,
  Pin,
  RefreshCw,
  Flame,
  ShieldAlert,
} from 'lucide-react';
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

// Rich dynamic commentary bank organized by persona personality & sentiment
const PERSONA_COMMENT_BANKS = {
  genZ: {
    positive: [
      (topic: string) => `bro cooked with this one fr 🔥 the part about ${topic} was actually insane, sending this to the gc right now`,
      (topic: string) => `nah this is actually valid 🔥 10/10 hook, instant bookmark for later`,
      (topic: string) => `wait this is actually super useful?? finally someone explained ${topic} without 10 mins of yapping`,
      (topic: string) => `my attention span is 3 seconds and I actually watched the whole thing 😭 W post`,
      (topic: string) => `the pacing on this is crazy good... save to favorites immediately 🔥`,
      (topic: string) => `no cap this just saved me like 3 hours of trial and error haha W breakdown`,
    ],
    critical: [
      (topic: string) => `lost me in the first 2 seconds ngl... need a faster punchline or visual cut 💀`,
      (topic: string) => `too much yapping at the start, skipped in 0.8s on my FYP feed`,
      (topic: string) => `bro literally wrote an essay for a short post 😭 simplify it`,
      (topic: string) => `opening frame had zero visual contrast, thumb swiped past instantly 💀`,
      (topic: string) => `feels like every other sponsored ad on my feed, skip in 1.5s`,
    ],
  },
  casualScroller: {
    positive: [
      (topic: string) => `Adding this to my saved bookmarks that I tell myself I'll check this weekend 😂`,
      (topic: string) => `Paused my scroll immediately when you mentioned ${topic}! Super clean format.`,
      (topic: string) => `Straight to the point without any fluff. More posts like this please!`,
      (topic: string) => `Actually learned something new in 15 seconds while waiting for coffee haha`,
      (topic: string) => `Simple, clean, and easy to understand. Shared with a friend.`,
    ],
    critical: [
      (topic: string) => `Scrolled right past after 2 seconds. Too much dense text to read on mobile.`,
      (topic: string) => `Caught my eye briefly, but not provocative enough to stick around to the end.`,
      (topic: string) => `Felt a bit repetitive by the 5-second mark, swiped away.`,
      (topic: string) => `Didn't understand what the main takeaway was before the video moved on.`,
    ],
  },
  creator: {
    positive: [
      (topic: string, p: string) => `From a creator standpoint: The opening retention hook + save anchor is textbook. The 3-second pacing curve is going to perform very well on ${p}.`,
      (topic: string, p: string) => `Notice how the hook creates an immediate open curiosity loop? Masterclass in short-form script architecture for ${p}.`,
      (topic: string, p: string) => `The seamless transition back to the hook is brilliant for the loop multiplier algorithm. Well structured!`,
      (topic: string, p: string) => `Visual cue and pattern interrupt in the first 1.2s will pass the seed batch easily on ${p}. High retention score.`,
      (topic: string, p: string) => `Great use of numbers and specific timeframes to anchor viewer expectations. Stealing this structure!`,
    ],
    critical: [
      (topic: string, p: string) => `Good premise on ${topic}, but tighten the opening frame — drop the intro fluff and start right on the payoff reveal.`,
      (topic: string, p: string) => `Watch out: your retention drop-off will happen around second 4 without a secondary visual pattern interrupt.`,
      (topic: string, p: string) => `Needs a clearer bookmark CTA at the ending to trigger platform save utility algorithms on ${p}.`,
      (topic: string, p: string) => `The pacing dragged in the middle third. Cut 20% of the words to keep viewer velocity high.`,
    ],
  },
  skeptic: {
    positive: [
      (topic: string) => `Specific numbers, realistic timeframe, and lack of exaggerated hype make this credible. Worth evaluating the full breakdown on ${topic}.`,
      (topic: string) => `Appreciate that you gave concrete data points rather than vague motivational slogans. Solid proof of concept.`,
      (topic: string) => `The logic holds up under scrutiny. The counter-intuitive framing is backed by tangible utility.`,
      (topic: string) => `Checked the premise against industry standards — surprisingly accurate and grounded. Bookmarking.`,
    ],
    critical: [
      (topic: string) => `Where is the empirical data to support this? The hook makes an outsized promise without tangible backing.`,
      (topic: string) => `Wait, does this actually work in practice or is it another freemium tool paywall in 2 minutes?`,
      (topic: string) => `Sounds like standard algorithm hype. Needs immediate verification in the first 2 seconds.`,
      (topic: string) => `Correlation vs causation here. You need to control for baseline variables before claiming these numbers on ${topic}.`,
      (topic: string) => `The sample size for this claim is way too small to draw sweeping conclusions.`,
    ],
  },
  nicheExpert: {
    positive: [
      (topic: string) => `Practical and actionable framework. The breakdown on ${topic} has strong reference utility that professionals can implement immediately.`,
      (topic: string) => `Accurate breakdown. The distinction made here is often overlooked in mainstream surface-level advice. Bookmarked.`,
      (topic: string) => `High signal-to-noise ratio. Rare to see genuine technical nuance explained so crisply in short-form content.`,
      (topic: string) => `Spot on analysis. This aligns directly with current production best practices in the field.`,
    ],
    critical: [
      (topic: string) => `Oversimplified. You missed key domain nuance regarding ${topic} which undermines the premise for advanced practitioners.`,
      (topic: string) => `Needs to go deeper into technical implementation details rather than general surface advice.`,
      (topic: string) => `The framework breaks down at enterprise/production scale — add caveats for edge cases.`,
      (topic: string) => `Good intro level summary, but seasoned experts will find the conclusions slightly derivative.`,
    ],
  },
};

export const PersonaDebateStream: React.FC<PersonaDebateStreamProps> = ({
  reactions = [],
  caption = '',
  platform = 'tiktok',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'positive'>('all');
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [customLikes, setCustomLikes] = useState<Record<string, number>>({});
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 10000));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Clean topic for contextual comments
  const cleanTopic = useMemo(() => {
    if (!caption || !caption.trim()) return 'this strategy';
    const words = caption
      .replace(/#\w+/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^\w\s]/gi, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    if (words.length >= 2) {
      return `"${words.slice(0, 4).join(' ')}"`;
    }
    return 'this breakdown';
  }, [caption]);

  // Re-roll seed whenever user requests a fresh debate or reactions change
  const handleShuffle = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSeed(Math.floor(Math.random() * 100000));
      setIsRefreshing(false);
    }, 200);
  };

  // Generate dynamic, rotating comments from each persona
  const comments = useMemo((): SimulatedComment[] => {
    if (!reactions || reactions.length === 0) return [];

    return reactions.map((r, idx) => {
      const pName = r.persona_name || r.name || `Persona 0${idx + 1}`;
      const pLower = pName.toLowerCase();
      const reasoning = r.reasoning || '';
      const strength = Array.isArray(r.strengths) && r.strengths.length > 0 ? r.strengths[0] : '';
      const weakness = Array.isArray(r.weaknesses) && r.weaknesses.length > 0 ? r.weaknesses[0] : '';
      const stopScrollProb = Number(
        r.stop_scroll_probability ??
          (typeof r.stop_scroll === 'number' ? r.stop_scroll : r.stop_scroll ? 1 : 0)
      );
      const stopScroll = typeof r.stop_scroll === 'boolean' ? r.stop_scroll : stopScrollProb >= 0.5;
      const saveProb = Number(r.save_probability || 0);
      const likeProb = Number(r.like_probability || 0);
      const shareProb = Number(r.share_probability || 0);
      const watchProb = Number(r.watch_probability || 0);

      const isMetricsPositive =
        stopScroll &&
        (watchProb >= 0.45 || saveProb >= 0.3 || likeProb >= 0.3 || shareProb >= 0.25);

      // Determine sentiment
      const sentiment: 'positive' | 'critical' = isMetricsPositive ? 'positive' : 'critical';

      // Pick from dynamic persona comment bank using pseudo-random seed + index
      let commentText = '';
      const sample = <T,>(arr: T[], offset: number): T => {
        const i = (seed + idx * 7 + offset) % arr.length;
        return arr[i];
      };

      if (pLower.includes('gen-z') || pLower.includes('student') || pLower.includes('alpha') || pLower.includes('gamer')) {
        const pool = isMetricsPositive ? PERSONA_COMMENT_BANKS.genZ.positive : PERSONA_COMMENT_BANKS.genZ.critical;
        commentText = sample(pool, 1)(cleanTopic);
      } else if (pLower.includes('casual') || pLower.includes('scroller')) {
        const pool = isMetricsPositive ? PERSONA_COMMENT_BANKS.casualScroller.positive : PERSONA_COMMENT_BANKS.casualScroller.critical;
        commentText = sample(pool, 2)(cleanTopic);
      } else if (pLower.includes('creator') || pLower.includes('content')) {
        const pool = isMetricsPositive ? PERSONA_COMMENT_BANKS.creator.positive : PERSONA_COMMENT_BANKS.creator.critical;
        commentText = sample(pool, 3)(cleanTopic, platform.toUpperCase());
      } else if (pLower.includes('skeptic') || pLower.includes('analyst') || pLower.includes('quant')) {
        const pool = isMetricsPositive ? PERSONA_COMMENT_BANKS.skeptic.positive : PERSONA_COMMENT_BANKS.skeptic.critical;
        commentText = sample(pool, 4)(cleanTopic);
      } else if (pLower.includes('niche') || pLower.includes('expert') || pLower.includes('prof') || pLower.includes('academic')) {
        const pool = isMetricsPositive ? PERSONA_COMMENT_BANKS.nicheExpert.positive : PERSONA_COMMENT_BANKS.nicheExpert.critical;
        commentText = sample(pool, 5)(cleanTopic);
      } else {
        // Custom Persona fallback
        if (r.simulated_comment) {
          commentText = r.simulated_comment;
        } else if (isMetricsPositive) {
          commentText = `Evaluated through custom archetype lens: ${strength || 'Solid high-resonance structure.'} Strong alignment with target audience parameters.`;
        } else {
          commentText = `Friction identified: ${weakness || 'Requires stronger hook velocity and clearer payoff'} to satisfy this audience profile.`;
        }
      }

      // Dynamic likes calculation
      const baseLikes = isMetricsPositive ? 35 : 12;
      const randomizedLikes = baseLikes + ((seed + idx * 13) % 55);

      // Timestamps
      const minutesAgo = ((idx + 1) * 2 + (seed % 3)) + 1;

      // Dynamic replies for cross-persona debate
      const replies: SimulatedComment[] = [];
      const isFirst = idx === 0;
      const isSkeptic = pLower.includes('skeptic') || pLower.includes('analyst');
      const isCreator = pLower.includes('creator');

      if (isFirst && reactions.length > 1) {
        const otherPersona = reactions[1].persona_name || 'Content Creator';
        const replyPool = [
          `@${pName.split(' ')[0]} 100% agreed. On ${platform.toUpperCase()}, if you don't nail that first 1.5 seconds, nothing else matters.`,
          `@${pName.split(' ')[0]} Exactly. The algorithm uses the initial watch-through velocity to decide whether to push to broader cohorts.`,
          `@${pName.split(' ')[0]} This is why test batches either explode or stall at 250 views. Structure is everything.`,
        ];
        replies.push({
          id: `reply_${idx}_${seed}_1`,
          personaName: otherPersona,
          avatarLabel: 'CC',
          archetype: 'PEER CREATOR',
          sentiment: 'neutral',
          commentText: sample(replyPool, 11),
          likes: 18 + (seed % 20),
          timeAgo: `${minutesAgo - 1}m ago`,
        });
      } else if (isSkeptic && reactions.length > 2) {
        const replyPool = [
          `@${pName.split(' ')[0]} bro chill out not every single post needs a peer-reviewed research paper 😭`,
          `@${pName.split(' ')[0]} fair point on the metrics, but the core advice is still super actionable for beginners`,
          `@${pName.split(' ')[0]} actually tested this exact method last week and it worked for me, numbers check out!`,
        ];
        replies.push({
          id: `reply_${idx}_${seed}_2`,
          personaName: 'Gen-Z Student',
          avatarLabel: 'GZ',
          archetype: 'SPEED FILTER',
          sentiment: 'positive',
          commentText: sample(replyPool, 12),
          likes: 42 + (seed % 30),
          timeAgo: `${minutesAgo - 1}m ago`,
        });
      } else if (isCreator && reactions.length > 3) {
        const replyPool = [
          `@${pName.split(' ')[0]} Pacing is great, but make sure the educational substance matches the initial hook promise so saves stay high.`,
          `@${pName.split(' ')[0]} Great observation on retention curves. The second pattern interrupt is where most creators fail.`,
        ];
        replies.push({
          id: `reply_${idx}_${seed}_3`,
          personaName: 'Niche Domain Expert',
          avatarLabel: 'NE',
          archetype: 'DOMAIN EXPERT',
          sentiment: 'neutral',
          commentText: sample(replyPool, 13),
          likes: 22 + (seed % 15),
          timeAgo: `${minutesAgo - 1}m ago`,
        });
      }

      return {
        id: `c_${r.persona_id || idx}_${seed}`,
        personaName: pName,
        avatarLabel: pName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        archetype: r.archetype || `AGENT ${String(idx + 1).padStart(2, '0')}`,
        sentiment,
        commentText,
        likes: randomizedLikes,
        timeAgo: `${minutesAgo}m ago`,
        isPinned: idx === 1,
        replies,
      };
    });
  }, [reactions, caption, platform, cleanTopic, seed]);

  if (!reactions || reactions.length === 0) {
    return null;
  }

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-[#0D1117] hover:bg-[#D4FF00] hover:text-black text-[#D4FF00] border border-[#D4FF00]/50 px-2.5 py-1 text-[11px] font-black font-csmigrate cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000]"
            title="Cycle dynamic audience conversation angles and replies"
          >
            <RefreshCw className={clsx('w-3 h-3', isRefreshing && 'animate-spin')} />
            <span>ROTATE DEBATE (FRESH COMMENTS)</span>
          </button>

          <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/15 shadow-[2px_2px_0px_0px_#000]">
            <MessageSquare className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="font-bold text-white">{comments.length} AGENTS DELIBERATING</span>
          </div>
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
          SIMULATED FEED FOR:{' '}
          <strong className="text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40">
            {platform.toUpperCase()}
          </strong>
        </span>
      </div>

      {/* Comment Stream List */}
      <div
        className="flex flex-col gap-3.5 font-mechanismo"
        role="feed"
        aria-label="Persona comments"
      >
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
                  <Heart
                    className={clsx('w-3 h-3', isLiked && 'fill-[#D4FF00] text-[#D4FF00]')}
                  />
                  <span>{likesCount}</span>
                </button>

                <span className="text-white/20">·</span>
                <span className="uppercase text-[9px] text-[#5B6474]">
                  SIMULATED AGENT RESPONSE
                </span>
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
                            <span className="text-[9px] text-[#5B6474]">
                              [{reply.archetype}]
                            </span>
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
                            <Heart
                              className={clsx(
                                'w-2.5 h-2.5',
                                replyLiked && 'fill-[#D4FF00] text-[#D4FF00]'
                              )}
                            />
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
