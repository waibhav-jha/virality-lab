import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Cpu, ShieldAlert, Zap, ChevronDown, ChevronUp, Layers, Sliders } from 'lucide-react';
import { Platform } from '../../api/types';
import { PlatformAlgorithmPipelineSimulator } from './PlatformAlgorithmPipelineSimulator';

interface PlatformAlgorithmTelemetryProps {
  platform: Platform;
  caption?: string;
  transcript?: string;
  onApplyOptimizedFix?: (fixPrompt: string) => void;
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
  caption = '',
  transcript = '',
  onApplyOptimizedFix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullSimulator, setShowFullSimulator] = useState(false);
  const algo = PLATFORM_ALGORITHMS[platform] || PLATFORM_ALGORITHMS.tiktok;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="w-full bg-[#07080A] border-2 border-white/15 p-4 font-mechanismo flex flex-col gap-3.5 transition-all text-left shadow-[2px_2px_0px_0px_#000]"
        aria-label="Platform Algorithm Weight Telemetry"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="text-xs font-black text-white uppercase tracking-wider font-csmigrate">
              {algo.name}
            </span>
            <span className="text-[10px] text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40 font-black uppercase">
              {algo.codename}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowFullSimulator(!showFullSimulator)}
              className={clsx(
                'flex items-center gap-1.5 text-[10px] px-2 py-0.5 border font-black uppercase transition-all cursor-pointer shadow-[1px_1px_0px_0px_#000]',
                showFullSimulator
                  ? 'border-[#00FF41] bg-[#00FF41] text-black shadow-[2px_2px_0px_0px_#00FF41]'
                  : 'border-[#D4FF00]/50 bg-[#D4FF00]/10 text-[#D4FF00] hover:bg-[#D4FF00] hover:text-black'
              )}
            >
              <Layers className="w-3 h-3" />
              <span>{showFullSimulator ? '⚡ CLOSE SIMULATOR' : '⚡ 3-STAGE ALGORITHM PIPELINE'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[10px] text-[#8E98AA] hover:text-[#D4FF00] cursor-pointer uppercase transition-colors font-bold"
            >
              <span>{isExpanded ? '[ HIDE SPEC ]' : '[ WEIGHT MATRIX ]'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3 text-[#D4FF00]" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Primary Archetype & Focus Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#646E82] uppercase tracking-wider font-bold">ALGORITHMIC ARCHETYPE</span>
            <span className="text-white font-black text-xs font-csmigrate">{algo.archetype}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#646E82] uppercase tracking-wider font-bold">INITIAL SEED BATCH</span>
            <span className="text-[#00FF41] font-bold text-xs">{algo.seedBatchSize}</span>
          </div>
        </div>

        {/* Algorithmic Weight Distribution Bar Strip */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8E98AA] uppercase font-bold">
            <span>ALGORITHM SCORING WEIGHTS</span>
            <span>100% COMPOSITE VECTOR</span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="h-2.5 w-full flex bg-[#0E1015] overflow-hidden border-2 border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
            {algo.weights.map((w, idx) => {
              const colors = ['bg-[#D4FF00]', 'bg-[#00FF41]', 'bg-[#FF0055]', 'bg-[#8E98AA]'];
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1.5 font-mechanismo">
            {algo.weights.map((w, idx) => {
              const dotColors = ['text-[#D4FF00]', 'text-[#00FF41]', 'text-[#FF0055]', 'text-[#8E98AA]'];
              return (
                <div
                  key={w.label}
                  className="flex items-start gap-1.5 p-2 bg-[#060709] border border-white/10 text-[10px] shadow-[1px_1px_0px_0px_#000]"
                >
                  <span className={clsx('font-black mt-0.5', dotColors[idx % dotColors.length])}>●</span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-black">{w.pct}%</span>
                      <span className="text-[#A2ABB9] font-bold truncate">{w.label}</span>
                    </div>
                    <span className="text-[9px] text-[#646E82] font-sans line-clamp-1 leading-tight mt-0.5">
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
          <div className="flex flex-col gap-2.5 pt-3 border-t-2 border-white/15 text-xs">
            {/* Critical Algorithm Penalty Alert */}
            <div className="p-3 bg-[#1A0505] border-l-2 border-[#EF4444] flex items-start gap-2 shadow-[2px_2px_0px_0px_#000]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#EF4444] font-black uppercase">CRITICAL ALGORITHMIC PENALTY:</span>
                <span className="text-[#E2E6EC] font-sans text-xs">{algo.primaryPenalty}</span>
              </div>
            </div>

            {/* Optimization Focus */}
            <div className="p-3 bg-[#0E1508] border-l-2 border-[#D4FF00] flex items-start gap-2 shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-3.5 h-3.5 text-[#D4FF00] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#D4FF00] font-black uppercase">ALGORITHM OPTIMIZATION TARGET:</span>
                <span className="text-[#E2E6EC] font-sans text-xs">{algo.optimizationFocus}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Interactive 3-Stage Algorithmic Pipeline & Sandbox Simulator */}
      {showFullSimulator && (
        <PlatformAlgorithmPipelineSimulator
          platform={platform}
          caption={caption}
          transcript={transcript}
          onApplyOptimizedFix={onApplyOptimizedFix}
        />
      )}
    </div>
  );
};
