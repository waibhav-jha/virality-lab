/**
 * TypeScript Type Definitions for Virality Lab API & UI State.
 * Mirrors Backend Pydantic Models with Full Type Safety.
 */

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x' | 'linkedin' | 'generic';

export type MediaType = 'short_video' | 'long_video' | 'image' | 'carousel' | 'text';

export type OptimizationObjective =
  | 'overall'
  | 'retention'
  | 'shares'
  | 'comments'
  | 'saves'
  | 'conversion';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type PipelineStage =
  | 'queued'
  | 'analyzing'
  | 'simulating'
  | 'scoring'
  | 'optimizing'
  | 'completed'
  | 'failed';

export interface ContentInput {
  id?: string;
  platform: Platform;
  media_type: MediaType;
  caption?: string;
  transcript?: string;
  media_path?: string;
  thumbnail_path?: string;
  target_audience?: string;
  goal?: string;
  metadata?: Record<string, any>;
}

export interface TargetAudienceConfig {
  description?: string;
  persona_weights?: Record<string, number>;
  selected_personas?: string[];
}

export interface FullAnalysisRequest {
  content: ContentInput;
  target_audience?: TargetAudienceConfig;
  goal?: OptimizationObjective;
  optimization_enabled?: boolean;
  optimization_iterations?: number;
  async_execution?: boolean;
}

export interface PersonaReaction {
  persona_id: string;
  persona_name: string;
  stop_scroll: boolean;
  stop_scroll_probability: number;
  watch_probability: number;
  completion_probability: number;
  like_probability: number;
  comment_probability: number;
  share_probability: number;
  save_probability: number;
  follow_probability: number;
  emotional_response?: string;
  reasoning?: string;
  strengths?: string[];
  weaknesses?: string[];
  simulated_comment?: string;
  perceived_hook_score?: number;
  perceived_pacing_score?: number;
}

export interface SimulationResult {
  content_id: string;
  platform: string;
  reactions: PersonaReaction[];
  total_personas: number;
  completed_personas: number;
  execution_time_ms: number;
  metadata?: Record<string, any>;
}

export interface SignalAttribution {
  signal_id: string;
  signal_name: string;
  category: 'hook' | 'cognitive' | 'utility' | 'retention' | 'platform_fit' | 'virality';
  impact_points: number; // e.g. +9.0, -15.0
  matched_text?: string;
  rationale: string;
  confidence: number;
}

export interface FormulaBreakdown {
  formula_equation: string;
  raw_weighted_sum: number;
  platform_weights: Record<string, number>;
  platform_multiplier: number;
  platform_bonus_points: number;
  calibrated_final_score: number;
}

export interface RetentionFunnelStep {
  step_name: string;
  time_seconds: number;
  retention_percentage: number;
  dropoff_percentage: number;
  friction_note: string;
}

export interface VariantDifferential {
  metric_name: string;
  baseline_value: number;
  challenger_value: number;
  delta: number;
  advantage: 'challenger' | 'baseline' | 'neutral';
  causal_explanation: string;
}

export interface FactorImpactItem {
  factor_name: string;
  contribution_pct: number;
  description: string;
}

export interface ABTestExplanation {
  bayesian_win_probability: number;
  statistical_confidence_pct: number;
  margin_of_error_pct: number;
  top_win_drivers: string[];
  differentials: VariantDifferential[];
  factor_impacts?: FactorImpactItem[];
}

export interface ViralityScoreBreakdown {
  retention_score: number;
  engagement_score: number;
  shareability_score: number;
  conversion_score: number;
  raw_virality_score: number;
  calibrated_virality_score: number;
  confidence_score: number;
  percentile_estimate?: number;
  performance_tier?: string;
  dimension_weights?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  audience_agreement?: number;
  polarization_index?: number;
  signal_attributions?: SignalAttribution[];
  formula_breakdown?: FormulaBreakdown;
  retention_funnel?: RetentionFunnelStep[];
  diagnostics_summary?: string[];
}

export interface CandidateVariant {
  variant_id: string;
  strategy: string;
  caption: string;
  hook: string;
  changes_summary: string;
  simulated_score?: number;
  improvement_delta?: number;
  strengths?: string[];
  weaknesses?: string[];
  is_winner?: boolean;
}

export interface OptimizationResult {
  original_content_id: string;
  objective: string;
  original_score: number;
  best_score: number;
  overall_improvement: number;
  variants_tested: number;
  iterations_run: number;
  candidate_variants: CandidateVariant[];
  winning_variant?: CandidateVariant;
  diagnostics_summary?: string[];
}

export interface FullAnalysisResponse {
  run_id: string;
  status: string;
  content?: ContentInput;
  content_profile?: Record<string, any>;
  simulation?: SimulationResult;
  score?: ViralityScoreBreakdown;
  optimization?: OptimizationResult;
  best_content?: ContentInput;
  best_score?: ViralityScoreBreakdown;
  overall_improvement?: number;
}

export interface JobStatusResponse {
  run_id: string;
  status: JobStatus;
  stage: PipelineStage;
  progress: number;
  message: string;
  result?: FullAnalysisResponse;
  error?: Record<string, any>;
}

export interface UploadResponse {
  file_path: string;
  filename: string;
  size_bytes: number;
  mime_type?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  simulation_mode: string;
  llm_provider: string;
  timestamp: string;
}

export interface PersonaBallot {
  persona_name: string;
  preferred_variant_id: string;
  reasoning: string;
  persona_id?: string;
  score_a?: number;
  score_b?: number;
  score_c?: number;
  key_trigger?: string;
}

export interface ABComparisonVariant {
  id: string;
  label: string;
  caption: string;
  score: ViralityScoreBreakdown;
  vote_count: number;
  vote_percentage: number;
  key_advantage: string;
  reactions: PersonaReaction[];
}

export interface ABComparisonResult {
  variants: ABComparisonVariant[];
  winner_id: string;
  win_margin: number;
  persona_ballots: PersonaBallot[];
  executive_summary: string;
  differential_matrix?: VariantDifferential[];
  factor_impact_breakdown?: FactorImpactItem[];
  bayesian_win_probability?: number;
  statistical_confidence_pct?: number;
  margin_of_error_pct?: number;
  top_win_drivers?: string[];
}

export interface PlatformMatrixItem {
  platform: Platform;
  platform_name: string;
  score: number;
  tier: string;
  retention_score: number;
  engagement_score: number;
  shareability_score: number;
  rank: number;
  is_best_fit: boolean;
  algorithm_synergy: string;
  platform_tweak: string;
  reach_multiplier: string;
  adapted_specimen?: string;
}

export interface CrossPlatformMatrixResult {
  best_platform: Platform;
  best_score: number;
  items: PlatformMatrixItem[];
  distribution_strategy: string;
}

export interface CustomPersonaDefinition {
  id: string;
  name: string;
  desc: string;
  archetype: string;
  attention_span_seconds: number;
  skepticism_level: number; // 0 to 100
  comment_style: string;
  is_custom?: boolean;
}

export interface ViralHookCandidate {
  id: string;
  archetype: 'contrarian' | 'curiosity_framework' | 'story_transformation';
  archetype_label: string;
  hook_text: string;
  predicted_stop_scroll: number;
  angle_summary: string;
}

export interface CohortStage {
  stage_number: number;
  stage_name: string;
  impressions_range: string;
  gate_metric_name: string;
  gate_target_threshold: number;
  gate_actual_value: number;
  unit?: string;
  passed: boolean;
  verdict_reason: string;
}

export interface AlgorithmBoost {
  boost_id: string;
  label: string;
  multiplier_factor: string;
  rationale: string;
}

export interface AlgorithmPenalty {
  penalty_id: string;
  label: string;
  severity: 'critical' | 'moderate' | 'minor';
  impact: string;
  rationale: string;
}

export interface PlatformAlgorithmEvaluation {
  platform: Platform;
  algorithm_name: string;
  codename: string;
  archetype: string;
  overall_compatibility_score: number;
  predicted_reach_tier: string;
  projected_impressions_estimate: string;
  cohort_stages: CohortStage[];
  ranking_weights: Record<string, number>;
  detected_boosts: AlgorithmBoost[];
  detected_penalties: AlgorithmPenalty[];
  primary_actionable_fix: string;
}
