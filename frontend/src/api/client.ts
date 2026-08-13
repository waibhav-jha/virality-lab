/**
 * Typed API Client for Virality Lab Backend.
 * Handles fetch calls, standard error parsing, and full type safety.
 */

import {
  FullAnalysisRequest,
  FullAnalysisResponse,
  HealthResponse,
  JobStatusResponse,
  OptimizationObjective,
  UploadResponse,
} from './types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let details: any = null;
    try {
      const rawText = await response.text();
      try {
        const errJson = JSON.parse(rawText);
        if (errJson.detail) {
          errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        } else if (errJson.error && errJson.error.message) {
          errorDetail = errJson.error.message;
        }
        details = errJson;
      } catch {
        if (rawText && rawText.trim()) {
          errorDetail = rawText.length > 200 ? `${rawText.slice(0, 200)}...` : rawText;
        }
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorDetail, details);
  }

  return response.json();
}


function normalizePlatform(p?: string): string {
  if (!p) return 'generic';
  const val = p.toLowerCase().trim();
  if (val === 'instagram' || val === 'reels') return 'instagram_reels';
  if (val === 'youtube' || val === 'shorts') return 'youtube_shorts';
  if (val === 'x' || val === 'twitter') return 'x_twitter';
  return val;
}

function normalizeGoal(g?: string): string {
  if (!g) return 'overall';
  const val = g.toLowerCase().trim();
  if (val === 'conversion') return 'followers';
  return val;
}

function normalizeMediaType(m?: string): string {
  if (!m) return 'short_video';
  const val = m.toLowerCase().trim();
  if (val === 'video' || val === 'long_video') return 'short_video';
  if (val === 'text') return 'text_post';
  return val;
}

export const hasBackend = (): boolean => {
  if (BASE_URL && BASE_URL.trim() !== '') return true;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return false;
};

export const viralityApi = {
  /**
   * Health & System State
   */
  async checkHealth(): Promise<HealthResponse> {
    if (!hasBackend()) {
      return {
        status: 'standalone',
        version: '0.8.0',
        simulation_mode: 'client_deterministic',
        llm_provider: 'in_browser',
        timestamp: new Date().toISOString(),
      };
    }
    return request<HealthResponse>('/health');
  },

  /**
   * File Upload (Video, Image)
   */
  async uploadMedia(file: File): Promise<UploadResponse> {
    if (!hasBackend()) {
      return {
        file_path: URL.createObjectURL(file),
        filename: file.name,
        size_bytes: file.size,
        mime_type: file.type,
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    return request<UploadResponse>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Run Full End-to-End Pipeline (Analyze -> Simulate -> Score -> Optimize)
   */
  async runPipeline(
    payload: FullAnalysisRequest
  ): Promise<FullAnalysisResponse | JobStatusResponse> {
    if (!hasBackend()) {
      throw new Error('Using in-browser client simulation engine.');
    }
    const normalizedPayload = {
      ...payload,
      content: {
        ...payload.content,
        platform: normalizePlatform(payload.content?.platform),
        media_type: normalizeMediaType(payload.content?.media_type),
      },
      goal: normalizeGoal(payload.goal),
    };

    return request<FullAnalysisResponse | JobStatusResponse>('/api/run', {
      method: 'POST',
      body: JSON.stringify(normalizedPayload),
    });
  },

  /**
   * Poll Status for a Running Job
   */
  async getRunStatus(runId: string): Promise<JobStatusResponse> {
    if (!hasBackend()) {
      throw new Error('No backend job polling needed in browser mode.');
    }
    return request<JobStatusResponse>(`/api/runs/${encodeURIComponent(runId)}`);
  },

  /**
   * List Recent Runs
   */
  async listRuns(limit: number = 10): Promise<JobStatusResponse[]> {
    if (!hasBackend()) {
      return [];
    }
    return request<JobStatusResponse[]>(`/api/runs?limit=${limit}`);
  },

  /**
   * Optimize Existing Content
   */
  async optimize(payload: {
    content: any;
    objective?: OptimizationObjective;
    max_iterations?: number;
    content_profile?: any;
    virality_score?: any;
  }): Promise<any> {
    if (!hasBackend()) {
      throw new Error('Using in-browser client optimization engine.');
    }
    return request<any>('/api/optimize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

