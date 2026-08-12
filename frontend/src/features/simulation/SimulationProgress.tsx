import React from 'react';
import { clsx } from 'clsx';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { PipelineStage, JobStatus } from '../../api/types';

interface SimulationProgressProps {
  status: JobStatus;
  stage: PipelineStage;
  progress: number;
  message?: string;
  runId?: string;
}

const STAGES: { id: PipelineStage; label: string; desc: string; index: string }[] = [
  { id: 'analyzing', index: '01', label: 'MULTIMODAL EXTRACTION', desc: 'Hook syntax, rhythm cadence & drop-off triggers' },
  { id: 'simulating', index: '02', label: 'AUDIENCE DELIBERATION', desc: '5 autonomous persona evaluation engines' },
  { id: 'scoring', index: '03', label: 'VIRALITY CALIBRATION', desc: 'Synthesizing retention, share & engagement vectors' },
  { id: 'optimizing', index: '04', label: 'VARIANT RE-TESTING', desc: 'Generating and benchmarking optimization candidates' },
];

export const SimulationProgress: React.FC<SimulationProgressProps> = ({
  status,
  stage,
  progress,
  message,
  runId,
}) => {
  const getStageIndex = (s: PipelineStage): number => {
    switch (s) {
      case 'analyzing':
        return 0;
      case 'simulating':
        return 1;
      case 'scoring':
        return 2;
      case 'optimizing':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(stage);

  return (
    <div className="w-full bg-[#0E1013] border border-white/15 p-5 sm:p-6 text-left flex flex-col gap-5 corner-ticks" aria-label="Simulation Telemetry Matrix">
      {/* Top Header Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {status === 'failed' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : status === 'completed' ? (
            <Check className="w-4 h-4 text-[#D4FF00] shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-[#D4FF00] shrink-0" />
          )}

          <div className="flex flex-col font-mono-tech">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-tight">
                {status === 'failed'
                  ? 'SIMULATION HALTED'
                  : status === 'completed'
                  ? 'EXPERIMENT EXECUTION COMPLETE'
                  : 'AUDIENCE SIMULATION IN PROGRESS'}
              </span>
              <span className="text-[10px] bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30 px-1.5 py-0.2 uppercase font-bold">
                STAGE: {stage}
              </span>
            </div>
            <span className="text-xs text-[#7E8798] mt-0.5 font-sans">
              {message || 'Deliberating content against autonomous persona panel...'}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-4 font-mono-tech text-xs self-end sm:self-center">
          {runId && (
            <span className="text-[#5B6474]">
              RUN_ID: <strong className="text-white">{runId.slice(0, 8)}</strong>
            </span>
          )}
          <span className="text-base font-bold text-[#D4FF00]">{progress}%</span>
        </div>
      </div>

      {/* Precision Hairline Progress Bar */}
      <div className="w-full bg-white/10 h-1.5 overflow-hidden relative">
        <div
          className="h-full bg-[#D4FF00] transition-all duration-300 ease-out"
          style={{ width: `${Math.max(4, progress)}%` }}
        />
      </div>

      {/* Editorial Stage Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono-tech text-xs">
        {STAGES.map((s, idx) => {
          const isDone = currentIdx > idx || status === 'completed';
          const isCurrent = currentIdx === idx && status === 'running';

          return (
            <div
              key={s.id}
              className={clsx(
                'p-3 border transition-all flex flex-col justify-between gap-1.5',
                isCurrent
                  ? 'bg-[#D4FF00]/5 border-[#D4FF00]/50 text-white'
                  : isDone
                  ? 'bg-white/[0.02] border-white/20 text-white/90'
                  : 'bg-transparent border-white/5 text-[#4A5364] opacity-50'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#7E8798]">[{s.index}]</span>
                <span className="text-[10px] font-bold">
                  {isDone ? (
                    <span className="text-[#D4FF00]">[✓ DONE]</span>
                  ) : isCurrent ? (
                    <span className="text-[#D4FF00] animate-pulse">[● ACTIVE]</span>
                  ) : (
                    <span>[○ PENDING]</span>
                  )}
                </span>
              </div>

              <div className="font-bold text-xs uppercase tracking-tight">{s.label}</div>
              <p className="text-[10px] text-[#7E8798] font-sans leading-tight mt-0.5">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
