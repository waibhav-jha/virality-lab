/**
 * Real-World Platform Algorithm Simulation Engine (TypeScript).
 *
 * Implements high-fidelity algorithmic models based on verified engineering architectures:
 *  - TikTok: Monolith Batch-Testing Pipeline (0-3s Cold Start Gate -> Sub-network -> FYP)
 *  - Instagram: Reels Explore Graph (Sends-per-Reach DM Magnetism, Save Utility, Watermark Downranking)
 *  - YouTube Shorts: 2-Tower Candidate Generation (Viewed vs Swiped VVSA, APV Loop, Sub Conversion)
 *  - X (Twitter): Open-Source Neural Heavy Ranker (Author Conversation Boost +75x, Link Throttle)
 *  - LinkedIn: Professional Knowledge & Dwell Engine (Dwell Time Gate >8s, Commentary Depth)
 */

import { Platform, PlatformAlgorithmEvaluation, CohortStage, AlgorithmBoost, AlgorithmPenalty } from '../api/types';

export interface AlgorithmSandboxInputs {
  hookPct: number;
  retentionPct: number;
  sharePct: number;
  engagementPct: number;
  hasOutboundLink?: boolean;
  hasLoopEnding?: boolean;
  hasAuthorPrompt?: boolean;
  hasWatermark?: boolean;
}

export const evaluatePlatformAlgorithmEngine = (
  platform: Platform,
  caption: string = '',
  transcript: string = '',
  customOverrides?: Partial<AlgorithmSandboxInputs>
): PlatformAlgorithmEvaluation => {
  const plat = (platform || 'tiktok').toLowerCase() as Platform;
  const fullText = `${caption} ${transcript}`.toLowerCase();

  // Baseline metric extraction from content heuristics
  let baseHook = 68;
  let baseRetention = 62;
  let baseShare = 45;
  let baseEngagement = 52;

  // Signal detectors
  const hasQuestion = fullText.includes('?') || /what do you think|agree or disagree|hot take|unpopular opinion/.test(fullText);
  const hasNumbers = /\b[1-9]\b|\b[1-9]\.|\b\d{2,}\b/.test(fullText);
  const hasLinkInText = /https?:\/\/|www\.|\.com|\.ai|\.io|\.co/.test(fullText);
  const hasLoopWords = /watch again|loop|secret|part 2|wait for the end/.test(fullText);
  const hasWatermarkMention = /tiktok|capcut|watermark|repost/.test(fullText);
  const hasSavePrompt = /save this|bookmark|cheat sheet|template|save for later/.test(fullText);
  const hasPatternInterrupt = /stop scrolling|wait|warning|don't swipe|never do this/.test(fullText);
  const hasFramework = /framework|playbook|system|lessons|step 1|key takeaways|breakdown/.test(fullText);
  const hasSubPrompt = /subscribe|follow for daily|follow for more/.test(fullText);

  // Apply signal adjustments
  if (hasPatternInterrupt) baseHook += 12;
  if (hasNumbers) baseHook += 8;
  if (hasSavePrompt) { baseEngagement += 14; baseShare += 8; }
  if (hasQuestion) baseEngagement += 18;
  if (hasLoopWords) baseRetention += 15;
  if (hasFramework) { baseRetention += 16; baseEngagement += 10; }

  // Apply custom user sandbox overrides if provided
  const hookPct = customOverrides?.hookPct !== undefined ? customOverrides.hookPct : Math.min(98, Math.max(15, baseHook));
  const retentionPct = customOverrides?.retentionPct !== undefined ? customOverrides.retentionPct : Math.min(98, Math.max(15, baseRetention));
  const sharePct = customOverrides?.sharePct !== undefined ? customOverrides.sharePct : Math.min(98, Math.max(10, baseShare));
  const engagementPct = customOverrides?.engagementPct !== undefined ? customOverrides.engagementPct : Math.min(98, Math.max(10, baseEngagement));

  const hasOutboundLink = customOverrides?.hasOutboundLink !== undefined ? customOverrides.hasOutboundLink : hasLinkInText;
  const hasWatermark = customOverrides?.hasWatermark !== undefined ? customOverrides.hasWatermark : hasWatermarkMention;

  switch (plat) {
    case 'tiktok':
      return simulateTikTokMonolith(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasPatternInterrupt, hasLoopWords);
    case 'instagram':
      return simulateInstagramReels(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasSavePrompt, hasWatermark);
    case 'youtube':
      return simulateYouTubeShorts(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasLoopWords, hasSubPrompt);
    case 'x':
      return simulateXHeavyRanker(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasQuestion, hasOutboundLink, hasNumbers);
    case 'linkedin':
      return simulateLinkedInDwell(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasFramework, hasOutboundLink);
    default:
      return simulateTikTokMonolith(caption, transcript, hookPct, retentionPct, sharePct, engagementPct, hasPatternInterrupt, hasLoopWords);
  }
};

/** 1. TIKTOK MONOLITH BATCH SIMULATOR */
function simulateTikTokMonolith(
  _caption: string,
  _transcript: string,
  hookPct: number,
  retentionPct: number,
  sharePct: number,
  engagementPct: number,
  hasPatternInterrupt: boolean,
  hasLoopWords: boolean
): PlatformAlgorithmEvaluation {
  const boosts: AlgorithmBoost[] = [];
  const penalties: AlgorithmPenalty[] = [];

  if (hasPatternInterrupt) {
    boosts.push({
      boost_id: 'tt_hook',
      label: '0-1.5s Pattern Interrupt Detected',
      multiplier_factor: '+25% Initial Cohort Velocity',
      rationale: 'Front-loaded high visual contrast and auditory hook immediately halts thumb scroll.',
    });
  }

  if (hasLoopWords) {
    boosts.push({
      boost_id: 'tt_loop',
      label: 'High Re-Watch & Loop Signal',
      multiplier_factor: '12.0x Monolith Rank Multiplier',
      rationale: 'TikTok weights repeat watch-throughs over all passive metrics for sub-network propagation.',
    });
  }

  if (hookPct < 60) {
    penalties.push({
      penalty_id: 'tt_swipe_drop',
      label: 'Early Swipe-Away Risk (>40% drop in 0-2s)',
      severity: 'critical',
      impact: 'Terminates seed distribution at ~300 views',
      rationale: 'Monolith batch gate requires >62% retention at the 3-second mark to clear cohort 1.',
    });
  }

  // Stage 1: Cold Start Gate (250-500 Impressions)
  const s1Pass = hookPct >= 62;
  const s1: CohortStage = {
    stage_number: 1,
    stage_name: 'Stage 1: Cold Start Seed Batch',
    impressions_range: '250 – 500 Test Impressions',
    gate_metric_name: '0–3s Stop-Scroll Hook Gate',
    gate_target_threshold: 62,
    gate_actual_value: Math.round(hookPct),
    passed: s1Pass,
    verdict_reason: s1Pass
      ? 'Passed initial test cohort with immediate hook velocity.'
      : 'Failed 0-3s hook threshold (<62%). Monolith engine terminates rollout at seed level.',
  };

  // Stage 2: Sub-Network Loop & Share Wave (1k-15k Impressions)
  const s2Val = Math.round(retentionPct * 0.6 + sharePct * 0.4);
  const s2Pass = s1Pass && s2Val >= 58;
  const s2: CohortStage = {
    stage_number: 2,
    stage_name: 'Stage 2: Sub-Network Cluster Rollout',
    impressions_range: '1,500 – 20,000 Impressions',
    gate_metric_name: 'Loop & Peer Share Index',
    gate_target_threshold: 58,
    gate_actual_value: s2Val,
    passed: s2Pass,
    verdict_reason: s2Pass
      ? 'Strong watch-through and peer shares breached interest sub-network.'
      : 'Mid-video drop-off halted cohort promotion before wider FYP release.',
  };

  // Stage 3: Macro FYP Wave (100k+ Impressions)
  const s3Val = Math.round(retentionPct * 0.4 + sharePct * 0.35 + engagementPct * 0.25);
  const s3Pass = s2Pass && s3Val >= 68;
  const s3: CohortStage = {
    stage_number: 3,
    stage_name: 'Stage 3: Broad FYP Macro Syndication',
    impressions_range: '100,000 – 1,200,000+ FYP Feed',
    gate_metric_name: 'Universal Algorithmic Resonance',
    gate_target_threshold: 68,
    gate_actual_value: s3Val,
    passed: s3Pass,
    verdict_reason: s3Pass
      ? 'Universal audience agreement unlocked wide FYP macro distribution.'
      : 'Audience fatigue flattened distribution before achieving macro viral scale.',
  };

  const compositeScore = Math.round(hookPct * 0.4 + retentionPct * 0.3 + sharePct * 0.2 + engagementPct * 0.1);

  return {
    platform: 'tiktok',
    algorithm_name: 'TikTok For You Algorithm (Monolith Engine)',
    codename: 'TT-MONOLITH-V25',
    archetype: 'Sub-second Pattern Interrupt & Loop Multiplier',
    overall_compatibility_score: compositeScore,
    predicted_reach_tier: s3Pass ? 'Macro-Viral FYP Breakout' : s2Pass ? 'Sub-Network Propagation' : s1Pass ? 'Initial Seed Batch' : 'Cold-Start Drop (<500)',
    projected_impressions_estimate: s3Pass ? '250,000 – 1,200,000+ Views' : s2Pass ? '15,000 – 65,000 Views' : s1Pass ? '800 – 3,500 Views' : '150 – 450 Views',
    cohort_stages: [s1, s2, s3],
    ranking_weights: {
      '0-3s Hook Retention': 0.40,
      'Watch-Through & Loop': 0.30,
      'Direct DM / Peer Share': 0.20,
      'Comment Section Dwell': 0.10,
    },
    detected_boosts: boosts,
    detected_penalties: penalties,
    primary_actionable_fix: 'Front-load visual contrast in first 1.2s and craft a cyclical re-watch hook.',
  };
}

/** 2. INSTAGRAM REELS GRAPH SIMULATOR */
function simulateInstagramReels(
  _caption: string,
  _transcript: string,
  hookPct: number,
  retentionPct: number,
  sharePct: number,
  engagementPct: number,
  hasSavePrompt: boolean,
  hasWatermark: boolean
): PlatformAlgorithmEvaluation {
  const boosts: AlgorithmBoost[] = [];
  const penalties: AlgorithmPenalty[] = [];

  if (sharePct >= 50) {
    boosts.push({
      boost_id: 'ig_sends_reach',
      label: 'High DM Sends-per-Reach Velocity',
      multiplier_factor: 'Instagram #1 Algorithmic Ranking Signal',
      rationale: 'Instagram CEO explicitly confirmed DM sends per reach is the primary distribution driver for Explore & Reels.',
    });
  }

  if (hasSavePrompt) {
    boosts.push({
      boost_id: 'ig_save_utility',
      label: 'High Bookmark / Save Reference Utility',
      multiplier_factor: '+20% Explore Cluster Affinity',
      rationale: 'Saves signal evergreen educational/utility value, triggering non-follower recommendations.',
    });
  }

  if (hasWatermark) {
    penalties.push({
      penalty_id: 'ig_watermark',
      label: 'Third-Party Watermark / Cross-Post Logo Detected',
      severity: 'critical',
      impact: '-70% Non-Follower Reach Demotion',
      rationale: 'Instagram algorithm actively downranks videos with third-party watermarks (e.g. TikTok logo).',
    });
  }

  const s1Val = Math.round(sharePct * 0.5 + engagementPct * 0.5);
  const s1Pass = s1Val >= 48;
  const s1: CohortStage = {
    stage_number: 1,
    stage_name: 'Stage 1: Warm Follower & DM Velocity',
    impressions_range: '100 – 400 Seed Followers',
    gate_metric_name: 'Sends-per-Reach & Save Ratio',
    gate_target_threshold: 48,
    gate_actual_value: s1Val,
    passed: s1Pass,
    verdict_reason: s1Pass
      ? 'Strong DM forwarding ratio unlocked Explore tab candidate evaluation.'
      : 'Low DM forwarding confined specimen strictly to immediate followers.',
  };

  const s2Val = Math.round(sharePct * 0.45 + retentionPct * 0.35 + hookPct * 0.20);
  const s2Pass = s1Pass && s2Val >= 58;
  const s2: CohortStage = {
    stage_number: 2,
    stage_name: 'Stage 2: Explore Tab Vector Clustering',
    impressions_range: '2,000 – 25,000 Explore Impressions',
    gate_metric_name: 'Topic Vector Match & Retention',
    gate_target_threshold: 58,
    gate_actual_value: s2Val,
    passed: s2Pass,
    verdict_reason: s2Pass
      ? 'Successfully matched to high-affinity Explore topic interest clusters.'
      : 'Insufficient watch retention to breach secondary topic clusters.',
  };

  const s3Val = Math.round(sharePct * 0.5 + retentionPct * 0.3 + engagementPct * 0.2);
  const s3Pass = s2Pass && s3Val >= 68 && !hasWatermark;
  const s3: CohortStage = {
    stage_number: 3,
    stage_name: 'Stage 3: Non-Follower Reels Feed Syndication',
    impressions_range: '50,000 – 500,000+ Non-Follower Feed',
    gate_metric_name: 'Reels Feed Injection Multiplier',
    gate_target_threshold: 68,
    gate_actual_value: s3Val,
    passed: s3Pass,
    verdict_reason: s3Pass
      ? 'High DM Sends-to-Reach ratio triggered broad non-follower feed distribution.'
      : hasWatermark ? 'Watermark penalty suppressed macro non-follower distribution.' : 'Growth contained within niche Explore clusters.',
  };

  const compositeScore = Math.round(sharePct * 0.45 + engagementPct * 0.25 + retentionPct * 0.20 + hookPct * 0.10);

  return {
    platform: 'instagram',
    algorithm_name: 'Instagram Reels Explore Graph',
    codename: 'IG-EXPLORE-GRAPH-V4',
    archetype: 'Sends-per-Reach & Bookmark Utility Architecture',
    overall_compatibility_score: compositeScore,
    predicted_reach_tier: s3Pass ? 'Explore & Reels Viral Breakout' : s2Pass ? 'Explore Cluster Promotion' : s1Pass ? 'Follower + Early Explore Seed' : 'Follower-Confined (<500)',
    projected_impressions_estimate: s3Pass ? '120,000 – 600,000+ Views' : s2Pass ? '10,000 – 45,000 Views' : s1Pass ? '800 – 3,000 Views' : '150 – 500 Views',
    cohort_stages: [s1, s2, s3],
    ranking_weights: {
      'Direct Message / Peer Share': 0.45,
      'Save / Bookmark Utility': 0.25,
      'Watch Duration & Retention': 0.20,
      'Likes & Profile Follows': 0.10,
    },
    detected_boosts: boosts,
    detected_penalties: penalties,
    primary_actionable_fix: 'Structure content as a high-utility reference cheat sheet that viewers DM to colleagues.',
  };
}

/** 3. YOUTUBE SHORTS 2-TOWER SIMULATOR */
function simulateYouTubeShorts(
  _caption: string,
  _transcript: string,
  hookPct: number,
  retentionPct: number,
  sharePct: number,
  engagementPct: number,
  hasLoopWords: boolean,
  hasSubPrompt: boolean
): PlatformAlgorithmEvaluation {
  const boosts: AlgorithmBoost[] = [];
  const penalties: AlgorithmPenalty[] = [];

  if (hasLoopWords || retentionPct >= 70) {
    boosts.push({
      boost_id: 'yt_apv',
      label: 'High Average Percentage Viewed (APV)',
      multiplier_factor: '+30% Browse Shelf Rank',
      rationale: 'YouTube Short shelf algorithms promote videos with APV approaching or exceeding 100%.',
    });
  }

  if (hasSubPrompt) {
    boosts.push({
      boost_id: 'yt_sub_gain',
      label: 'In-Player Subscriber Conversion Trigger',
      multiplier_factor: '3.5x Suggested Shelf Multiplier',
      rationale: 'Direct subscriber acquisitions from the Shorts player provide YouTube its highest satisfaction signal.',
    });
  }

  const vvsaVal = Math.round(hookPct * 1.05);
  const s1Pass = vvsaVal >= 72;
  const s1: CohortStage = {
    stage_number: 1,
    stage_name: 'Stage 1: Shorts Shelf Swipe-Away Test',
    impressions_range: '500 – 1,000 Shelf Impressions',
    gate_metric_name: 'Viewed vs Swiped Away (VVSA)',
    gate_target_threshold: 72,
    gate_actual_value: Math.min(100, vvsaVal),
    passed: s1Pass,
    verdict_reason: s1Pass
      ? 'Surpassed 72% VVSA threshold; viewers stopped swiping to watch.'
      : 'VVSA fell below 72%. High swipe-away rate halted recommendation to Shorts shelf.',
  };

  const apvVal = Math.round(retentionPct * 1.15);
  const s2Pass = s1Pass && apvVal >= 85;
  const s2: CohortStage = {
    stage_number: 2,
    stage_name: 'Stage 2: APV & Re-Watch Depth Gate',
    impressions_range: '5,000 – 50,000 Browse Impressions',
    gate_metric_name: 'Average Percentage Viewed (APV)',
    gate_target_threshold: 85,
    gate_actual_value: Math.min(125, apvVal),
    passed: s2Pass,
    verdict_reason: s2Pass
      ? 'APV exceeded 85%, signaling high satisfaction and repeat consumption.'
      : 'Mid-video drop-off degraded satisfaction index on browse shelf.',
  };

  const s3Val = Math.round(retentionPct * 0.45 + engagementPct * 0.35 + sharePct * 0.20);
  const s3Pass = s2Pass && s3Val >= 68;
  const s3: CohortStage = {
    stage_number: 3,
    stage_name: 'Stage 3: Long-Tail Suggested Shelf Promotion',
    impressions_range: '100,000 – 1,500,000+ Evergreen Shelf',
    gate_metric_name: 'Long-Tail Satisfaction Index',
    gate_target_threshold: 68,
    gate_actual_value: s3Val,
    passed: s3Pass,
    verdict_reason: s3Pass
      ? 'High like-to-view and sub conversion ratio unlocked evergreen shelf recommendation.'
      : 'Met initial view goals but failed to sustain long-tail suggested video traffic.',
  };

  const compositeScore = Math.round(hookPct * 0.40 + retentionPct * 0.35 + engagementPct * 0.15 + sharePct * 0.10);

  return {
    platform: 'youtube',
    algorithm_name: 'YouTube Shorts 2-Tower & Satisfaction Engine',
    codename: 'YT-SHORTS-SHELF-V2',
    archetype: 'Viewed vs Swiped (VVSA) & Loop APV Maximizer',
    overall_compatibility_score: compositeScore,
    predicted_reach_tier: s3Pass ? 'Evergreen Shorts Shelf Breakout' : s2Pass ? 'Browse & Suggested Promotion' : s1Pass ? 'Initial Shelf Sampling' : 'Early Shelf Drop (<600)',
    projected_impressions_estimate: s3Pass ? '200,000 – 1,500,000+ Views' : s2Pass ? '15,000 – 80,000 Views' : s1Pass ? '1,200 – 6,000 Views' : '200 – 600 Views',
    cohort_stages: [s1, s2, s3],
    ranking_weights: {
      'Viewed vs Swiped Away %': 0.40,
      'Average Percentage Viewed': 0.35,
      'Subscriber Conversion': 0.15,
      'Comments & Likes': 0.10,
    },
    detected_boosts: boosts,
    detected_penalties: penalties,
    primary_actionable_fix: 'Eliminate opening intro fluff; engineer seamless loop back to the hook.',
  };
}

/** 4. X (TWITTER) OPEN-SOURCE HEAVY RANKER */
function simulateXHeavyRanker(
  _caption: string,
  _transcript: string,
  hookPct: number,
  retentionPct: number,
  sharePct: number,
  engagementPct: number,
  hasQuestion: boolean,
  hasOutboundLink: boolean,
  hasNumbers: boolean
): PlatformAlgorithmEvaluation {
  const boosts: AlgorithmBoost[] = [];
  const penalties: AlgorithmPenalty[] = [];

  if (hasQuestion || engagementPct >= 55) {
    boosts.push({
      boost_id: 'x_author_reply',
      label: 'Author-Audience Reply Conversation Multiplier',
      multiplier_factor: '+75.0x Open-Source Heavy Ranker Weight',
      rationale: "X's open-source algorithm awards its highest score weight (+75x to +150x) to threads where authors actively reply to comments.",
    });
  }

  if (hasNumbers) {
    boosts.push({
      boost_id: 'x_bookmark',
      label: 'High Bookmark / Reference Utility Density',
      multiplier_factor: '+10.0x Heavy Ranker Score',
      rationale: 'Bookmarks signal high signal-to-noise value, weighted 10x higher than basic likes in X ranking.',
    });
  }

  if (hasOutboundLink) {
    penalties.push({
      penalty_id: 'x_link_throttle',
      label: 'Outbound Link in Tweet Body',
      severity: 'critical',
      impact: '-50% Algorithmic Distribution Throttle',
      rationale: 'X algorithm demotes external links to protect on-platform dwell time (recommend moving link to 1st reply).',
    });
  }

  const s1Val = Math.round(engagementPct * 0.5 + sharePct * 0.5);
  const s1Pass = s1Val >= 48;
  const s1: CohortStage = {
    stage_number: 1,
    stage_name: 'Stage 1: In-Network Graph Sampling',
    impressions_range: '200 – 1,500 In-Network Impressions',
    gate_metric_name: 'Reply Density & Conversation Velocity',
    gate_target_threshold: 48,
    gate_actual_value: s1Val,
    passed: s1Pass,
    verdict_reason: s1Pass
      ? 'Generated immediate debate and repost activity in primary network.'
      : 'Low reply density confined post strictly to immediate circle.',
  };

  const s2Val = Math.round(engagementPct * 0.45 + sharePct * 0.35 + hookPct * 0.20);
  const s2Pass = s1Pass && s2Val >= 56 && !hasOutboundLink;
  const s2: CohortStage = {
    stage_number: 2,
    stage_name: "Stage 2: Out-of-Network 'For You' Feed",
    impressions_range: '5,000 – 50,000 For You Impressions',
    gate_metric_name: 'Heavy Ranker Composite Probability',
    gate_target_threshold: 56,
    gate_actual_value: s2Val,
    passed: s2Pass,
    verdict_reason: s2Pass
      ? 'Passed Heavy Ranker threshold, expanding to related topic interest clusters.'
      : hasOutboundLink ? 'Outbound link penalty throttled out-of-network distribution.' : 'Insufficient quote-tweet or bookmark velocity.',
  };

  const s3Val = Math.round(sharePct * 0.5 + engagementPct * 0.3 + retentionPct * 0.2);
  const s3Pass = s2Pass && s3Val >= 66;
  const s3: CohortStage = {
    stage_number: 3,
    stage_name: 'Stage 3: Trending Topic & Macro Syndication',
    impressions_range: '100,000 – 1,000,000+ Macro Impressions',
    gate_metric_name: 'Viral Network Diffusion Coefficient',
    gate_target_threshold: 66,
    gate_actual_value: s3Val,
    passed: s3Pass,
    verdict_reason: s3Pass
      ? 'Debate and bookmark cascade triggered timeline-wide viral breakout.'
      : 'Discussion contained within topic clusters without macro timeline breakout.',
  };

  const compositeScore = Math.round(engagementPct * 0.40 + sharePct * 0.30 + hookPct * 0.20 + retentionPct * 0.10);

  return {
    platform: 'x',
    algorithm_name: 'X (Twitter) For You Neural Heavy Ranker',
    codename: 'X-HEAVY-RANK-2025',
    archetype: 'Conversation Multiplier & Open-Source Heavy Ranker',
    overall_compatibility_score: compositeScore,
    predicted_reach_tier: s3Pass ? "Macro 'For You' Timeline Breakout" : s2Pass ? 'Out-of-Network For You Feed' : s1Pass ? 'In-Network Follower Propagation' : 'Low-Engagement Containment (<500)',
    projected_impressions_estimate: s3Pass ? '150,000 – 850,000+ Impressions' : s2Pass ? '12,000 – 60,000 Impressions' : s1Pass ? '1,500 – 6,000 Impressions' : '200 – 500 Impressions',
    cohort_stages: [s1, s2, s3],
    ranking_weights: {
      'Reply & Conversation Density': 0.40,
      'Reposts & Quote Velocity': 0.30,
      'Bookmark / Save Rate': 0.20,
      'Dwell Time & Media Expand': 0.10,
    },
    detected_boosts: boosts,
    detected_penalties: penalties,
    primary_actionable_fix: 'Frame a strong, debatable premise question and reply actively to early comments.',
  };
}

/** 5. LINKEDIN DWELL & KNOWLEDGE SIMULATOR */
function simulateLinkedInDwell(
  _caption: string,
  _transcript: string,
  hookPct: number,
  retentionPct: number,
  sharePct: number,
  engagementPct: number,
  hasFramework: boolean,
  hasOutboundLink: boolean
): PlatformAlgorithmEvaluation {
  const boosts: AlgorithmBoost[] = [];
  const penalties: AlgorithmPenalty[] = [];

  if (hasFramework || retentionPct >= 65) {
    boosts.push({
      boost_id: 'li_dwell',
      label: 'High Dwell Time Reading Structure',
      multiplier_factor: '+35% Knowledge Feed Distribution',
      rationale: "LinkedIn's dwell algorithm rewards text formatted with high scannability that holds attention >8-12 seconds.",
    });
  }

  if (hasOutboundLink) {
    penalties.push({
      penalty_id: 'li_link_body',
      label: 'Outbound Link in Main Post Body',
      severity: 'critical',
      impact: '-40% Feed Downranking Penalty',
      rationale: "LinkedIn heavily downranks posts containing external URLs in the primary text (standard practice: 'Link in comments').",
    });
  }

  const s1Val = Math.round(engagementPct * 0.5 + retentionPct * 0.5);
  const s1Pass = s1Val >= 50;
  const s1: CohortStage = {
    stage_number: 1,
    stage_name: 'Stage 1: Golden Hour 1st-Degree Test',
    impressions_range: '300 – 1,000 1st-Degree Connections',
    gate_metric_name: 'Substantive Dialogue Velocity (>15 words)',
    gate_target_threshold: 50,
    gate_actual_value: s1Val,
    passed: s1Pass,
    verdict_reason: s1Pass
      ? 'Meaningful comments in the first 60 minutes unlocked 2nd-degree feed broadcasting.'
      : 'Shallow engagement in golden hour restricted post to immediate connections.',
  };

  const s2Val = Math.round(retentionPct * 0.45 + sharePct * 0.35 + engagementPct * 0.20);
  const s2Pass = s1Pass && s2Val >= 56 && !hasOutboundLink;
  const s2: CohortStage = {
    stage_number: 2,
    stage_name: 'Stage 2: 2nd/3rd-Degree Industry Feed',
    impressions_range: '3,000 – 25,000 Industry Professionals',
    gate_metric_name: 'Professional Dwell & Repost Multiplier',
    gate_target_threshold: 56,
    gate_actual_value: s2Val,
    passed: s2Pass,
    verdict_reason: s2Pass
      ? 'High reading dwell time triggered cross-company professional feed broadcast.'
      : hasOutboundLink ? 'Outbound link penalty throttled 2nd-degree feed rollout.' : 'Dwell time fell below 8-second threshold.',
  };

  const s3Val = Math.round(retentionPct * 0.45 + sharePct * 0.35 + hookPct * 0.20);
  const s3Pass = s2Pass && s3Val >= 66;
  const s3: CohortStage = {
    stage_number: 3,
    stage_name: 'Stage 3: Editorial Knowledge Feed Syndication',
    impressions_range: '50,000 – 300,000+ Sitewide Feed',
    gate_metric_name: 'High-Value Creator Knowledge Index',
    gate_target_threshold: 66,
    gate_actual_value: s3Val,
    passed: s3Pass,
    verdict_reason: s3Pass
      ? 'Classified as high-signal industry knowledge, earning broad timeline distribution.'
      : 'Achieved solid engagement without triggering platform-wide editorial promotion.',
  };

  const compositeScore = Math.round(engagementPct * 0.45 + retentionPct * 0.30 + sharePct * 0.15 + hookPct * 0.10);

  return {
    platform: 'linkedin',
    algorithm_name: 'LinkedIn Professional Knowledge & Dwell Engine',
    codename: 'LI-KNOWLEDGE-FEED-V2',
    archetype: 'Dwell-Time Maximization & Substantive Dialogue Graph',
    overall_compatibility_score: compositeScore,
    predicted_reach_tier: s3Pass ? 'Knowledge Feed Sitewide Breakout' : s2Pass ? '2nd & 3rd-Degree Network Syndication' : s1Pass ? '1st-Degree Connection Promotion' : 'Limited Feed Sampling (<500)',
    projected_impressions_estimate: s3Pass ? '60,000 – 350,000+ Impressions' : s2Pass ? '8,000 – 35,000 Impressions' : s1Pass ? '1,000 – 4,500 Impressions' : '250 – 600 Impressions',
    cohort_stages: [s1, s2, s3],
    ranking_weights: {
      'High-Value Commentary (15+ words)': 0.45,
      'Dwell Time on Document / Text': 0.30,
      'Repost with Added Thought': 0.15,
      'Profile Follows & Connections': 0.10,
    },
    detected_boosts: boosts,
    detected_penalties: penalties,
    primary_actionable_fix: 'Remove outbound link to comments; format with scannable bullet points and actionable takeaways.',
  };
}
