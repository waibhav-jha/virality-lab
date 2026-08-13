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
