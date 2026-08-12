import React from 'react';
import { X, ArrowRight, Database } from 'lucide-react';
import { JobStatusResponse } from '../api/types';
import { Badge } from '../design-system/Badge';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runs: JobStatusResponse[];
  onSelectRun: (run: JobStatusResponse) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  runs,
  onSelectRun,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Experiment Audit Ledger">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#07080A] border-l border-white/10 h-full p-6 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto text-left">
        <div className="flex flex-col gap-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#D4FF00]" />
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-tight">
                  AUDIT LOG // RUN HISTORY
                </h3>
                <span className="font-mono-tech text-[10px] text-[#7E8798] uppercase">
                  PERSISTED SIMULATION RUNS
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white border border-white/10 hover:border-white/30 cursor-pointer"
              aria-label="Close audit log"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Runs Ledger List */}
          <div className="flex flex-col gap-2.5">
            {runs.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-[#5B6474] gap-2 font-mono-tech">
                <Database className="w-6 h-6 opacity-30" />
                <span className="text-xs uppercase">No recorded runs in current session</span>
                <span className="text-[10px] text-[#4A5364]">
                  Execute an experiment to populate telemetry log
                </span>
              </div>
            ) : (
              runs.map((job, idx) => {
                const rawScore = (job.result?.score as any)?.overall_score ??
                  job.result?.score?.calibrated_virality_score ??
                  job.result?.score?.raw_virality_score;

                const normScore = rawScore !== undefined && rawScore !== null
                  ? (rawScore <= 1.0 && rawScore > 0 ? Math.round(rawScore * 100) : Math.round(rawScore))
                  : null;

                return (
                  <div
                    key={job.run_id}
                    onClick={() => {
                      onSelectRun(job);
                      onClose();
                    }}
                    className="p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#D4FF00]/50 transition-all cursor-pointer flex flex-col gap-2 group"
                  >
                    <div className="flex items-center justify-between font-mono-tech text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">[{String(idx + 1).padStart(2, '0')}]</span>
                        <span className="font-bold text-white tracking-wider">
                          {job.run_id.slice(0, 8)}
                        </span>
                        <Badge
                          variant={job.status === 'completed' ? 'accent' : job.status === 'failed' ? 'rose' : 'slate'}
                          size="sm"
                        >
                          {job.status}
                        </Badge>
                      </div>

                      {normScore !== null && (
                        <div className="flex items-baseline gap-1 font-mono-tech">
                          <span className="font-display font-black text-sm text-[#D4FF00]">
                            {normScore}
                          </span>
                          <span className="text-[9px] text-white/40">/100</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#9DA7B8] font-mono-tech line-clamp-2 leading-relaxed">
                      {job.result?.content?.caption || job.message || 'Standard specimen simulation run'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono-tech text-[10px] text-[#5B6474]">
                      <span className="uppercase">STAGE: {job.stage}</span>
                      <span className="flex items-center gap-1 text-[#D4FF00] group-hover:translate-x-0.5 transition-transform font-bold">
                        LOAD RUN <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-white/10 font-mono-tech text-center text-[10px] text-[#5B6474] uppercase tracking-widest">
          VIRALITY LAB SESSION TELEMETRY // MEMORY STORE
        </div>
      </div>
    </div>
  );
};
