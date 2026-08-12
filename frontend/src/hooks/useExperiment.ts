import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Platform,
  MediaType,
  OptimizationObjective,
  PipelineStage,
  JobStatus,
  FullAnalysisRequest,
  FullAnalysisResponse,
  JobStatusResponse,
  HealthResponse,
  CandidateVariant,
} from '../api/types';
import { viralityApi } from '../api/client';
import { SampleContent } from '../components/HeroSection';
import { DEMO_RESULT, DEMO_CONTENT } from '../data/demoFixtures';

const DEFAULT_PERSONAS = [
  'Gen-Z Student',
  'Casual Scroller',
  'Content Creator',
  'Skeptic Analyst',
  'Niche Expert',
];

export type ExperimentPhase = 'setup' | 'simulating' | 'results';

export function useExperiment() {
  // 1. Content & Configuration State
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [caption, setCaption] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [mediaPath, setMediaPath] = useState<string | undefined>(undefined);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'short_video' | 'image'>('short_video');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(DEFAULT_PERSONAS);
  const [objective, setObjective] = useState<OptimizationObjective>('overall');
  const [optimizationEnabled, setOptimizationEnabled] = useState<boolean>(true);

  // 2. Execution Pipeline State
  const [status, setStatus] = useState<JobStatus>('idle' as JobStatus);
  const [stage, setStage] = useState<PipelineStage>('queued');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [currentRunId, setCurrentRunId] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  // 3. System & History State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [history, setHistory] = useState<JobStatusResponse[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const pollingRef = useRef<any>(null);
  const stageTimersRef = useRef<any[]>([]);
  const completedJobRef = useRef<JobStatusResponse | null>(null);

  // Derive the current phase from state
  const phase: ExperimentPhase = (() => {
    if (status === 'running') return 'simulating';
    if (result) return 'results';
    return 'setup';
  })();

  const clearAllTimers = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    stageTimersRef.current.forEach(clearTimeout);
    stageTimersRef.current = [];
  };

  // Check backend health on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await viralityApi.checkHealth();
        setHealth(h);
      } catch (err: any) {
        console.warn('Backend unreachable:', err.message);
      }
      try {
        const pastRuns = await viralityApi.listRuns(10);
        setHistory(pastRuns);
      } catch (_) {}
    };
    fetchHealth();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Staged demo simulation — walks through pipeline stages with realistic delays
  const runDemoSimulation = useCallback(() => {
    clearAllTimers();
    setIsDemo(true);
    setError(null);
    setResult(null);
    completedJobRef.current = null;
    setCaption(DEMO_CONTENT.caption);
    setPlatform(DEMO_CONTENT.platform);
    setMediaType(DEMO_CONTENT.media_type);

    setStatus('running');
    setCurrentRunId('demo-run-001');

    setStage('analyzing');
    setProgress(15);
    setMessage('Reading your content and extracting hook syntax...');

    const addTimer = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      stageTimersRef.current.push(id);
    };

    addTimer(() => {
      setProgress(30);
      setMessage('Extracting hook, pacing rhythm, and emotional resonance...');
    }, 700);

    addTimer(() => {
      setStage('simulating');
      setProgress(48);
      setMessage('Simulating Gen-Z & Casual Scroller reactions...');
    }, 1400);

    addTimer(() => {
      setProgress(62);
      setMessage('Simulating Content Creator & Skeptic Analyst reactions...');
    }, 2100);

    addTimer(() => {
      setStage('scoring');
      setProgress(76);
      setMessage('Aggregating audience reactions into virality index...');
    }, 2800);

    addTimer(() => {
      setStage('optimizing');
      setProgress(88);
      setMessage('Generating alternative variants and re-simulating...');
    }, 3500);

    addTimer(() => {
      setProgress(95);
      setMessage('Selecting strongest candidate variant...');
    }, 4200);

    addTimer(() => {
      setStage('completed');
      setProgress(100);
      setStatus('completed');
      setMessage('Simulation complete.');
      setResult(DEMO_RESULT);
    }, 4800);
  }, []);

  // Finalize completed real run
  const finalizeRealRun = useCallback((job: JobStatusResponse) => {
    setStage('completed');
    setProgress(100);
    setStatus('completed');
    setMessage('Simulation complete.');
    if (job.result) {
      setResult(job.result);
      setHistory((prev) => [job, ...prev.filter((p) => p.run_id !== job.run_id)]);
    }
  }, []);

  // Launch real pipeline with smooth stage transitions
  const startSimulation = async () => {
    if (!caption.trim() && !mediaPath) {
      setError('Please provide a caption, script, or media file to simulate.');
      return;
    }

    clearAllTimers();
    setError(null);
    setResult(null);
    completedJobRef.current = null;
    setIsDemo(false);
    setStatus('running');

    // 1. Initiate smooth progressive stage timeline
    setStage('analyzing');
    setProgress(15);
    setMessage('Multimodal extraction: Evaluating hook syntax & stylistic signals...');

    const addTimer = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      stageTimersRef.current.push(id);
    };

    addTimer(() => {
      setProgress(32);
      setMessage('Analyzing reading level, curiosity gap, and structural hooks...');
    }, 600);

    addTimer(() => {
      setStage('simulating');
      setProgress(50);
      setMessage('Simulating audience reactions across 5 autonomous persona agents...');
    }, 1200);

    addTimer(() => {
      setProgress(68);
      setMessage('Evaluating stop-scroll, completion, and peer-share vectors...');
    }, 1800);

    addTimer(() => {
      setStage('scoring');
      setProgress(80);
      setMessage('Synthesizing calibrated virality potential and root-cause matrix...');
    }, 2400);

    if (optimizationEnabled) {
      addTimer(() => {
        setStage('optimizing');
        setProgress(92);
        setMessage('Generating hypothesis variants and benchmarking score lift...');
      }, 3000);
    }

    // Schedule completion check at 3600ms (or when backend result arrives)
    addTimer(() => {
      if (completedJobRef.current) {
        finalizeRealRun(completedJobRef.current);
      }
    }, optimizationEnabled ? 3600 : 2800);

    // 2. Fire backend pipeline request
    const payload: FullAnalysisRequest = {
      content: {
        platform,
        media_type: mediaType,
        caption: caption.trim(),
        transcript: transcript.trim() || undefined,
        media_path: mediaPath,
      },
      target_audience: { selected_personas: selectedPersonas },
      goal: objective,
      optimization_enabled: optimizationEnabled,
      optimization_iterations: 1,
      async_execution: true,
    };

    try {
      const response = await viralityApi.runPipeline(payload);
      if ('run_id' in response) {
        setCurrentRunId(response.run_id);

        // Start polling the backend job
        pollingRef.current = setInterval(async () => {
          try {
            const job = await viralityApi.getRunStatus(response.run_id);
            if (job.status === 'completed') {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
              completedJobRef.current = job;

              // If timers have finished or are close, finalize immediately
              if (stageTimersRef.current.length === 0) {
                finalizeRealRun(job);
              }
            } else if (job.status === 'failed') {
              clearAllTimers();
              setError(job.error?.message || job.message || 'Pipeline execution failed.');
              setStatus('failed');
            }
          } catch (err: any) {
            console.error('Polling error:', err);
          }
        }, 500);
      }
    } catch (err: any) {
      clearAllTimers();
      setStatus('failed');
      setStage('failed');
      setError(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? "Couldn't reach the backend server. Make sure it's running on port 8000, or try the demo instead."
          : err.message || 'Failed to communicate with the backend server.'
      );
    }
  };

  const loadSample = (sample: SampleContent) => {
    setPlatform(sample.platform);
    setCaption(sample.caption);
    setMediaType(sample.mediaType);
    setObjective(sample.goal);
    setMediaPath(undefined);
    setMediaUrl(undefined);
    setError(null);
  };

  const applyWinner = (variant: CandidateVariant) => {
    if (variant.caption) setCaption(variant.caption);
    else if (variant.hook) setCaption(variant.hook);
  };

  const resetExperiment = () => {
    clearAllTimers();
    completedJobRef.current = null;
    setStatus('idle' as JobStatus);
    setStage('queued');
    setProgress(0);
    setMessage('');
    setResult(null);
    setError(null);
    setCurrentRunId(undefined);
    setIsDemo(false);
  };

  const loadPastRun = (job: JobStatusResponse) => {
    if (job.result) {
      setResult(job.result);
      if (job.result.content) {
        if (job.result.content.caption) setCaption(job.result.content.caption);
        if (job.result.content.platform) setPlatform(job.result.content.platform);
      }
      setStatus('completed');
      setStage('completed');
      setProgress(100);
      setCurrentRunId(job.run_id);
      setIsDemo(false);
    }
  };

  const handleMediaSelected = (_file: File, path: string, previewUrl: string, detectedType: 'short_video' | 'image') => {
    setMediaPath(path);
    setMediaUrl(previewUrl);
    setMediaType(detectedType);
    setError(null);
  };

  const handleMediaCleared = () => {
    setMediaPath(undefined);
    setMediaUrl(undefined);
  };

  return {
    platform, setPlatform,
    caption, setCaption,
    transcript, setTranscript,
    mediaPath, mediaUrl, mediaType,
    selectedPersonas, setSelectedPersonas,
    objective, setObjective,
    optimizationEnabled, setOptimizationEnabled,
    handleMediaSelected, handleMediaCleared,
    status, stage, progress, message, currentRunId,
    result, error, setError,
    health, history,
    isHistoryOpen, setIsHistoryOpen,
    isDemo, phase,
    startSimulation, runDemoSimulation,
    loadSample, applyWinner, resetExperiment, loadPastRun,
  };
}
