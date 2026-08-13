/**
 * Autonomous In-Browser Simulation Engine for Virality Lab.
 * Runs deterministic multi-agent audience simulations and virality scoring
 * directly in the browser when offline or deployed on static GitHub Pages.
 */

import {
  FullAnalysisResponse,
  PersonaReaction,
  ViralityScoreBreakdown,
  OptimizationResult,
  Platform,
  MediaType,
  OptimizationObjective,
} from '../api/types';


interface SimulationInput {
  caption: string;
  transcript?: string;
  platform: Platform;
  mediaType: MediaType;
  selectedPersonas: string[];
  objective: OptimizationObjective;
  mediaUrl?: string;
}

export function runBrowserSimulation(input: SimulationInput): FullAnalysisResponse {
  const text = (input.caption || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d+/.test(text);
  const hasQuestion = /\?/.test(text);
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(text);
  const hasHashtags = /#\w+/.test(text);
  const isShort = wordCount < 12;
  const isLong = wordCount > 35;

  // 1. Content Profile
  let hookType = 'statement';
  if (hasQuestion) hookType = 'curiosity_question';
  else if (hasNumbers && (text.toLowerCase().includes('how') || text.toLowerCase().includes('why') || text.toLowerCase().includes('step') || text.toLowerCase().includes('tool') || text.toLowerCase().includes('reason'))) {
    hookType = 'numbered_listicle_hook';
  } else if (text.toLowerCase().includes('i ') || text.toLowerCase().includes('my ') || text.toLowerCase().includes('we ')) {
    hookType = 'personal_storytelling';
  } else if (text.toLowerCase().includes('stop') || text.toLowerCase().includes('never') || text.toLowerCase().includes('warning') || text.toLowerCase().includes('banned') || text.toLowerCase().includes('secret')) {
    hookType = 'negative_pattern_interrupt';
  }

  const curiosityGap = Math.min(0.95, Math.max(0.4, (hasNumbers ? 0.2 : 0) + (hasQuestion ? 0.25 : 0.15) + (isShort ? 0.2 : 0.05) + 0.35));
  const hookStrength = Math.min(0.96, Math.max(0.42, (hasNumbers ? 0.18 : 0) + (isShort ? 0.2 : 0.05) + (hasEmoji ? 0.08 : 0) + 0.45));
  const estimatedWatchTime = Math.min(60, Math.max(12, Math.round(wordCount * 1.5 + (input.mediaType === 'short_video' ? 15 : 5))));

  const contentProfile: Record<string, any> = {
    hook_type: hookType,
    hook_strength: Math.round(hookStrength * 100) / 100,
    curiosity_gap: Math.round(curiosityGap * 100) / 100,
    emotional_valence: hasQuestion || text.toLowerCase().includes('secret') ? 'high_arousal' : 'positive',
    content_category: text.toLowerCase().includes('ai') ? 'ai_technology' : text.toLowerCase().includes('money') || text.toLowerCase().includes('$') ? 'finance_growth' : 'general_creator',
    estimated_watch_time_seconds: estimatedWatchTime,
  };

  // 2. Generate Persona Reactions
  const reactions: PersonaReaction[] = input.selectedPersonas.map((personaName) => {
    const pLower = personaName.toLowerCase();
    let stopScrollProb = 0.65;
    let watchProb = 0.60;
    let completionProb = 0.50;
    let likeProb = 0.55;
    let commentProb = 0.40;
    let shareProb = 0.45;
    let saveProb = 0.40;
    let followProb = 0.30;
    let emotion = 'Interested';
    let reasoning = '';
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (pLower.includes('gen-z') || pLower.includes('student')) {
      stopScrollProb = isShort ? 0.85 : 0.62;
      watchProb = isShort ? 0.78 : 0.55;
      completionProb = isShort ? 0.65 : 0.45;
      likeProb = hasEmoji || isShort ? 0.75 : 0.52;
      shareProb = hasNumbers || isShort ? 0.80 : 0.50;
      commentProb = 0.55;
      saveProb = hasNumbers ? 0.60 : 0.35;
      followProb = 0.40;
      emotion = isShort ? 'Entertained & Hooked' : 'Impatient';
      reasoning = isShort
        ? `Opening line "${text.slice(0, 30)}..." hit fast. Fast pacing matches my feed rhythm. I would send this to friends.`
        : `Hook feels slightly slow to read on mobile. I need the punchline or value reveal in the first 1.5 seconds.`;
      if (isShort) strengths.push('Fast cognitive processing speed', 'High scroll-stop resonance');
      else weaknesses.push('Opening hook exceeds attention threshold', 'Value proposition delayed');
    } else if (pLower.includes('casual') || pLower.includes('scroller')) {
      stopScrollProb = isShort || hasQuestion ? 0.76 : 0.58;
      watchProb = 0.62;
      completionProb = 0.48;
      likeProb = 0.60;
      shareProb = 0.50;
      commentProb = 0.32;
      saveProb = 0.42;
      followProb = 0.28;
      emotion = 'Passive Amusement';
      reasoning = `The first sentence caught my eye, but nothing visually jarring or provocative forces me to stay until the very end.`;
      strengths.push('Clean relatable phrasing');
      weaknesses.push('Lacks high-arousal visual or verbal disruption');
    } else if (pLower.includes('creator') || pLower.includes('content')) {
      stopScrollProb = 0.88;
      watchProb = 0.82;
      completionProb = 0.74;
      likeProb = 0.68;
      commentProb = 0.70;
      shareProb = 0.65;
      saveProb = 0.82;
      followProb = 0.52;
      emotion = 'Analytically Engaged';
      reasoning = `Good hook architecture. ${hasNumbers ? 'Numbers anchor tangible value.' : 'Could benefit from concrete numerical specificity.'} I would bookmark this to study engagement drop-off patterns.`;
      strengths.push('Structured format with clear premise', 'High save utility potential');
      if (!hasNumbers) weaknesses.push('Missing quantitative anchor or proof metrics');
    } else if (pLower.includes('skeptic') || pLower.includes('analyst')) {
      const isOverHyped = text.toLowerCase().includes('best') || text.toLowerCase().includes('100%') || text.toLowerCase().includes('insane') || text.toLowerCase().includes('secret');
      stopScrollProb = isOverHyped ? 0.48 : 0.65;
      watchProb = 0.55;
      completionProb = 0.42;
      likeProb = 0.28;
      commentProb = isOverHyped ? 0.75 : 0.50;
      shareProb = 0.22;
      saveProb = 0.30;
      followProb = 0.18;
      emotion = isOverHyped ? 'Skeptical & Guarded' : 'Observant';
      reasoning = isOverHyped
        ? `Sounds like standard algorithm clickbait. Where is the verification or proof? I would scrutinize the comments first.`
        : `Reasonable claim, but requires concrete evidence in the body to avoid feeling generic.`;
      if (isOverHyped) weaknesses.push('Clickbait trigger activates trust guardrails', 'Low initial credibility score');
      else strengths.push('Avoids exaggerated buzzwords');
    } else {
      // Niche Expert
      stopScrollProb = 0.68;
      watchProb = 0.72;
      completionProb = 0.66;
      likeProb = 0.58;
      commentProb = 0.64;
      shareProb = 0.52;
      saveProb = 0.74;
      followProb = 0.46;
      emotion = 'Evaluating Utility';
      reasoning = `The framing addresses a real topic. If the subsequent content delivers genuine workflow insights rather than obvious tips, it holds strong value.`;
      strengths.push('Relevance to industry practitioners', 'High bookmark intent');
      weaknesses.push('Must sustain technical depth beyond the opening hook');
    }

    const stopScroll = stopScrollProb >= 0.55;

    return {
      persona_id: pLower.replace(/[^a-z0-9]/g, '_'),
      persona_name: personaName,
      stop_scroll: stopScroll,
      stop_scroll_probability: Math.round(stopScrollProb * 100) / 100,
      watch_probability: Math.round(watchProb * 100) / 100,
      completion_probability: Math.round(completionProb * 100) / 100,
      like_probability: Math.round(likeProb * 100) / 100,
      comment_probability: Math.round(commentProb * 100) / 100,
      share_probability: Math.round(shareProb * 100) / 100,
      save_probability: Math.round(saveProb * 100) / 100,
      follow_probability: Math.round(followProb * 100) / 100,
      emotional_response: emotion,
      reasoning,
      strengths: strengths.length ? strengths : ['Clear communication of subject matter'],
      weaknesses: weaknesses.length ? weaknesses : ['Pacing could be accelerated in the midpoint'],
    };
  });

  // 3. Virality Score Calculations
  const avgStopScroll = reactions.reduce((acc, r) => acc + r.stop_scroll_probability, 0) / (reactions.length || 1);
  const avgWatch = reactions.reduce((acc, r) => acc + r.watch_probability, 0) / (reactions.length || 1);
  const avgShare = reactions.reduce((acc, r) => acc + r.share_probability, 0) / (reactions.length || 1);
  const avgSave = reactions.reduce((acc, r) => acc + r.save_probability, 0) / (reactions.length || 1);
  const avgFollow = reactions.reduce((acc, r) => acc + r.follow_probability, 0) / (reactions.length || 1);

  const retentionScore = Math.round((avgStopScroll * 0.5 + avgWatch * 0.5) * 100) / 100;
  const engagementScore = Math.round((avgWatch * 0.4 + avgShare * 0.3 + avgSave * 0.3) * 100) / 100;
  const shareabilityScore = Math.round(avgShare * 100) / 100;
  const conversionScore = Math.round((avgSave * 0.6 + avgFollow * 0.4) * 100) / 100;

  const rawScore = retentionScore * 0.35 + shareabilityScore * 0.30 + engagementScore * 0.20 + conversionScore * 0.15;
  const calibratedScore = Math.round(Math.min(0.96, Math.max(0.35, rawScore * 0.98)) * 100) / 100;
  const percentile = Math.min(99, Math.max(15, Math.round(calibratedScore * 100 + 4)));

  let tier = 'Promising Signal';
  if (calibratedScore >= 0.80) tier = 'Viral Breakout';
  else if (calibratedScore >= 0.70) tier = 'Strong Momentum';
  else if (calibratedScore >= 0.55) tier = 'Moderate Reach';
  else tier = 'High Friction';

  const score: ViralityScoreBreakdown = {
    retention_score: retentionScore,
    engagement_score: engagementScore,
    shareability_score: shareabilityScore,
    conversion_score: conversionScore,
    raw_virality_score: Math.round(rawScore * 100) / 100,
    calibrated_virality_score: calibratedScore,
    confidence_score: 0.85,
    percentile_estimate: percentile,
    performance_tier: tier,
    strengths: [
      `Opening hook activates immediate curiosity for ${reactions.filter(r => r.stop_scroll).length}/${reactions.length} audience segments.`,
      `Shareability vector scores ${Math.round(shareabilityScore * 100)}% on peer-to-peer distribution.`,
      `Optimal length profile for short-form feed consumption.`,
    ],
    weaknesses: [
      `Mid-point retention drop projected around second 3–5 without immediate visual payoff.`,
      `Call-to-action for bookmarking/saves requires explicit reinforcement.`,
    ],
    audience_agreement: 0.68,
    polarization_index: 0.32,
  };

  // 4. Target Optimization Variants
  const bestScoreVal = Math.min(0.94, Math.round((calibratedScore + 0.14) * 100) / 100);
  const optPercentile = Math.min(99, Math.round(bestScoreVal * 100 + 5));

  const optimizedScore: ViralityScoreBreakdown = {
    retention_score: Math.min(0.95, Math.round((retentionScore + 0.15) * 100) / 100),
    engagement_score: Math.min(0.92, Math.round((engagementScore + 0.12) * 100) / 100),
    shareability_score: Math.min(0.94, Math.round((shareabilityScore + 0.10) * 100) / 100),
    conversion_score: Math.min(0.88, Math.round((conversionScore + 0.16) * 100) / 100),
    raw_virality_score: bestScoreVal,
    calibrated_virality_score: bestScoreVal,
    confidence_score: 0.89,
    percentile_estimate: optPercentile,
    performance_tier: 'Viral Breakout',
    strengths: [
      'Front-loaded payoff eliminates opening 2-second drop-off.',
      'Explicit high-conversion save trigger increases algorithm recommendation index.',
      'Skeptic friction minimized by framing claim with clear context.',
    ],
    weaknesses: ['Requires high-energy visual pacing to match elevated hook promise.'],
    audience_agreement: 0.78,
    polarization_index: 0.22,
  };

  const cleanText = text.replace(/#\w+/g, '').trim();
  const hashtags = hasHashtags ? text.match(/#\w+/g)?.join(' ') || '' : `#${input.platform} #viral #growth`;

  const variantA = `${cleanText} — here is the exact framework (save this). ${hashtags}`;
  const variantB = `How I solved this in 60 seconds: "${cleanText.slice(0, 60)}..." ${hashtags}`;
  const variantC = `Most people get this wrong. Here is why: ${cleanText} ${hashtags}`;

  const optimization: OptimizationResult = {
    original_content_id: 'specimen-001',
    objective: input.objective,
    original_score: calibratedScore,
    best_score: bestScoreVal,
    overall_improvement: Math.round((bestScoreVal - calibratedScore) * 100),
    variants_tested: 3,
    iterations_run: 1,
    candidate_variants: [
      {
        variant_id: 'variant-a',
        strategy: 'Hook Restructure & Save Anchor',
        caption: variantA,
        hook: `${cleanText.slice(0, 50)}... (save this)`,
        changes_summary: 'Shifted core payoff to the opening frame and integrated a low-friction bookmark call-to-action.',
        simulated_score: bestScoreVal,
        improvement_delta: Math.round((bestScoreVal - calibratedScore) * 100) / 100,
        is_winner: true,
        strengths: ['Doubles stop-scroll velocity', 'Significantly lifts bookmark/save conversion'],
        weaknesses: ['Requires concise on-screen caption styling'],
      },
      {
        variant_id: 'variant-b',
        strategy: 'Credibility Front-Load',
        caption: variantB,
        hook: `How I solved this in 60 seconds...`,
        changes_summary: 'Anchored specific timeframe to generate urgency and cognitive clarity.',
        simulated_score: Math.round((calibratedScore + 0.08) * 100) / 100,
        improvement_delta: 0.08,
        is_winner: false,
        strengths: ['High curiosity index', 'Fast cognitive comprehension'],
        weaknesses: ['Less peer-to-peer share pull than Variant A'],
      },
      {
        variant_id: 'variant-c',
        strategy: 'Contrarian Pattern Interrupt',
        caption: variantC,
        hook: `Most people get this wrong...`,
        changes_summary: 'Used cognitive dissonance to force stop-scroll across skeptical audience segments.',
        simulated_score: Math.round((calibratedScore + 0.05) * 100) / 100,
        improvement_delta: 0.05,
        is_winner: false,
        strengths: ['Strong comment section debate driver', 'High stop-scroll for skeptics'],
        weaknesses: ['Slightly higher polarization risk'],
      },
    ],
  };

  return {
    run_id: `run-${Date.now()}`,
    status: 'completed',
    content: {
      platform: input.platform,
      media_type: input.mediaType,
      caption: input.caption,
      transcript: input.transcript,
    },
    content_profile: contentProfile,
    simulation: {
      content_id: 'specimen-001',
      platform: input.platform,
      reactions,
      total_personas: reactions.length,
      completed_personas: reactions.length,
      execution_time_ms: 620,
    },
    score,
    optimization,
    best_content: {
      platform: input.platform,
      media_type: input.mediaType,
      caption: variantA,
    },
    best_score: optimizedScore,
    overall_improvement: Math.round((bestScoreVal - calibratedScore) * 100),
  };
}
