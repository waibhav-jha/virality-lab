import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Cpu, ShieldAlert, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Platform } from '../../api/types';

interface PlatformAlgorithmTelemetryProps {
  platform: Platform;
}

interface AlgorithmProfile {
  name: string;
  codename: string;
  archetype: string;
  weights: { label: string; pct: number; desc: string }[];
  primaryPenalty: string;
  optimizationFocus: string;
  seedBatchSize: string;
}

const PLATFORM_ALGORITHMS: Record<Platform, AlgorithmProfile> = {
  tiktok: {
    name: 'TikTok For You Algorithm',
    codename: 'TT-ALG-2025-V3',
    archetype: 'Rapid Velocity & Pattern Interrupt',
    weights: [
      { label: '0–3s Hook Retention', pct: 40, desc: 'Initial scroll-halt & opening pacing velocity' },
      { label: 'Watch-Through & Loop Rate', pct: 30, desc: 'Full completion & repeated loop consumption' },
      { label: 'Direct Share / DM Velocity', pct: 20, desc: 'Speed of peer-to-peer forwarding' },
      { label: 'Comment Section Dwell', pct: 10, desc: 'Reading & participating in discussions' },
    ],
    primaryPenalty: 'Swipe-Away Rate > 65% in first 2 seconds terminates wider cohort rollout.',
    optimizationFocus: 'Front-load visual contrast and auditory hook within first 1.5 seconds.',
    seedBatchSize: '250 – 500 Test Impressions',
  },
  instagram: {
    name: 'Instagram Reels Explore Graph',
    codename: 'IG-REEL-GRAPH-V4',
    archetype: 'Peer-to-Peer Relatability & DM Multiplier',
    weights: [
      { label: 'Direct Message / Peer Share', pct: 45, desc: 'Sends via Instagram DM (highest algorithmic weight)' },
      { label: 'Save / Bookmark Utility', pct: 25, desc: 'Intent to reference specimen later' },
      { label: 'Watch Duration & Retention', pct: 20, desc: 'Percentage of video consumed' },
      { label: 'Likes & Profile Follows', pct: 10, desc: 'Direct creator interest and discovery' },
    ],
    primaryPenalty: 'Low Share-to-View ratio confines specimen to existing follower distribution.',
    optimizationFocus: 'Craft highly relatable or bookmark-worthy framework that viewers send to peers.',
    seedBatchSize: '100 – 300 Seed Followers & Explore',
  },
  youtube: {
    name: 'YouTube Shorts Shelf Engine',
    codename: 'YT-SHORTS-SHELF-V2',
    archetype: 'Viewed vs Swiped & Long-Tail Satisfaction',
    weights: [
      { label: 'Viewed vs Swiped Away %', pct: 40, desc: 'Ratio of users choosing to watch vs swiping instantly' },
      { label: 'Average Percentage Viewed', pct: 35, desc: 'Completion depth (>100% loop signals breakout)' },
      { label: 'Subscriber Conversion', pct: 15, desc: 'Viewer clicking Subscribe from Shorts player' },
      { label: 'Comments & Likes', pct: 10, desc: 'Community interaction & feedback' },
    ],
    primaryPenalty: 'Viewed Rate below 70% in initial test batch halts algorithmic promotion to feed.',
    optimizationFocus: 'Eliminate opening intro fluff; engineer seamless loop back to the hook.',
    seedBatchSize: '500 – 1,000 Initial Shelf Impressions',
  },
  x: {
    name: 'X (Twitter) For You Neural Ranker',
    codename: 'X-HEAVY-RANK-2025',
    archetype: 'Contrarian Curiosity & Public Debate',
    weights: [
      { label: 'Reply & Conversation Density', pct: 40, desc: 'Deep reply threads & bidirectional debate' },
      { label: 'Reposts & Quote Velocity', pct: 30, desc: 'Amplification onto secondary follower graphs' },
      { label: 'Bookmark / Save Rate', pct: 20, desc: 'High signal-to-noise reference value' },
      { label: 'Dwell Time & Media Expand', pct: 10, desc: 'Seconds spent reading or tapping media' },
    ],
    primaryPenalty: 'External links without native commentary or zero reply density throttle reach by 50%.',
    optimizationFocus: 'Frame strong, debatable premises that trigger opinionated replies.',
    seedBatchSize: 'Dynamic Network Affinity Cluster',
  },
  linkedin: {
    name: 'LinkedIn Professional Distribution Engine',
    codename: 'LI-KNOWLEDGE-FEED-V2',
    archetype: 'Professional Authority & Actionable Substance',
    weights: [
      { label: 'High-Value Commentary (15+ words)', pct: 45, desc: 'Substantive professional debate over simple emojis' },
      { label: 'Dwell Time on Document / Text', pct: 30, desc: 'Time spent consuming actionable frameworks' },
      { label: 'Repost with Added Thought', pct: 15, desc: 'Thought leaders sharing to their networks' },
      { label: 'Profile Follows & Connection Requests', pct: 10, desc: 'Downstream professional interest' },
    ],
    primaryPenalty: 'Pure clickbait or generic engagement-bait triggers severe distribution downranking.',
    optimizationFocus: 'Structure with clean scannable bullet points, concrete numbers, and industry takeaways.',
    seedBatchSize: '1st & 2nd Degree Network Sampling',
  },
  generic: {
    name: 'Universal Content Intelligence Ranker',
    codename: 'UNI-VIRAL-INDEX',
    archetype: 'Balanced Engagement & Retention Synthesis',
    weights: [
      { label: 'Hook & Retention', pct: 35, desc: 'Opening engagement hold' },
      { label: 'Peer Share Multiplier', pct: 30, desc: 'Forwarding and syndication velocity' },
      { label: 'Discussion Density', pct: 20, desc: 'Commentary and debate signals' },
      { label: 'Save / Bookmark Rate', pct: 15, desc: 'Reference utility capture' },
    ],
    primaryPenalty: 'Early drop-off within the first 25% of content length.',
    optimizationFocus: 'Clarity of value proposition, strong opening pattern interrupt, and actionable payoff.',
    seedBatchSize: 'Multi-Channel Benchmark Cohort',
  },
};

export const PlatformAlgorithmTelemetry: React.FC<PlatformAlgorithmTelemetryProps> = ({
  platform,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const algo = PLATFORM_ALGORITHMS[platform] || PLATFORM_ALGORITHMS.tiktok;

  return (
    <div
      className="w-full bg-[#07080A] border border-white/10 p-4 font-mono-tech flex flex-col gap-3.5 transition-all text-left"
      aria-label="Platform Algorithm Weight Telemetry"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {algo.name}
          </span>
          <span className="text-[10px] text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/30 font-semibold uppercase">
            {algo.codename}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] text-[#7E8798] hover:text-white cursor-pointer uppercase transition-colors"
        >
          <span>{isExpanded ? '[ HIDE SPEC SHEET ]' : '[ INSPECT WEIGHT MATRIX ]'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Primary Archetype & Focus Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#5B6474] uppercase tracking-wider">ALGORITHMIC ARCHETYPE</span>
          <span className="text-white font-bold text-xs">{algo.archetype}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-[#5B6474] uppercase tracking-wider">INITIAL SEED BATCH</span>
          <span className="text-[#D4FF00] font-bold text-xs">{algo.seedBatchSize}</span>
        </div>
      </div>

      {/* Algorithmic Weight Distribution Bar Strip */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#7E8798] uppercase">
          <span>ALGORITHM SCORING WEIGHTS</span>
          <span>100% COMPOSITE VECTOR</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-2 w-full flex bg-white/10 overflow-hidden border border-white/10">
          {algo.weights.map((w, idx) => {
            const colors = ['bg-[#D4FF00]', 'bg-white', 'bg-[#7E8798]', 'bg-[#3A4250]'];
            return (
              <div
                key={w.label}
                className={clsx('h-full transition-all duration-500', colors[idx % colors.length])}
                style={{ width: `${w.pct}%` }}
                title={`${w.label}: ${w.pct}%`}
              />
            );
          })}
        </div>

        {/* Weight Labels Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1.5 font-mono-tech">
          {algo.weights.map((w, idx) => {
            const dotColors = ['text-[#D4FF00]', 'text-white', 'text-[#7E8798]', 'text-[#4A5364]'];
            return (
              <div
                key={w.label}
                className="flex items-start gap-1.5 p-1.5 bg-white/[0.02] border border-white/5 text-[10px]"
              >
                <span className={clsx('font-bold mt-0.5', dotColors[idx % dotColors.length])}>●</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-bold">{w.pct}%</span>
                    <span className="text-[#9DA7B8] font-semibold truncate">{w.label}</span>
                  </div>
                  <span className="text-[9px] text-[#5B6474] font-sans line-clamp-1 leading-tight">
                    {w.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Spec Sheet (Critical Penalty & Optimization Focus) */}
      {isExpanded && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10 text-xs">
          {/* Critical Algorithm Penalty Alert */}
          <div className="p-2.5 bg-red-950/20 border-l-2 border-red-400 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-red-400 font-bold uppercase">CRITICAL ALGORITHMIC PENALTY:</span>
              <span className="text-[#E2E6EC] font-sans text-xs">{algo.primaryPenalty}</span>
            </div>
          </div>

          {/* Optimization Focus */}
          <div className="p-2.5 bg-[#D4FF00]/5 border-l-2 border-[#D4FF00] flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-[#D4FF00] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#D4FF00] font-bold uppercase">ALGORITHM OPTIMIZATION TARGET:</span>
              <span className="text-[#E2E6EC] font-sans text-xs">{algo.optimizationFocus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
