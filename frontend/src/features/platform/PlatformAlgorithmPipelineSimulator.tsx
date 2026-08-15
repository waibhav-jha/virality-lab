import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Cpu,
  ShieldAlert,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Share2,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { Platform } from '../../api/types';
import {
  evaluatePlatformAlgorithmEngine,
  AlgorithmSandboxInputs,
} from '../../engine/platformAlgorithmEngine';

interface PlatformAlgorithmPipelineSimulatorProps {
  platform: Platform;
  caption: string;
  transcript?: string;
  onApplyOptimizedFix?: (fixPrompt: string) => void;
}

export const PlatformAlgorithmPipelineSimulator: React.FC<PlatformAlgorithmPipelineSimulatorProps> = ({
  platform,
  caption,
  transcript = '',
  onApplyOptimizedFix,
}) => {
  const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);
  const [sandboxInputs, setSandboxInputs] = useState<AlgorithmSandboxInputs>({
    hookPct: 75,
    retentionPct: 68,
    sharePct: 52,
    engagementPct: 60,
    hasOutboundLink: false,
    hasLoopEnding: true,
    hasAuthorPrompt: true,
    hasWatermark: false,
  });

  // Evaluate algorithm either from real specimen signals or sandbox controls
  const evaluation = useMemo(() => {
    return evaluatePlatformAlgorithmEngine(
      platform,
      caption,
      transcript,
      sandboxEnabled ? sandboxInputs : undefined
    );
  }, [platform, caption, transcript, sandboxEnabled, sandboxInputs]);

  const handleResetSandbox = () => {
    setSandboxInputs({
      hookPct: 75,
      retentionPct: 68,
      sharePct: 52,
      engagementPct: 60,
      hasOutboundLink: false,
      hasLoopEnding: true,
      hasAuthorPrompt: true,
      hasWatermark: false,
    });
  };

  return (
    <div
      className="w-full bg-[#07080A] border-2 border-white/20 p-5 sm:p-7 font-mechanismo flex flex-col gap-6 text-left shadow-[4px_4px_0px_0px_#000]"
      aria-label="Interactive Platform Recommendation Algorithm Pipeline Simulator"
    >
      {/* 1. Header Bar with Platform Engine Identity */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4FF00] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white uppercase font-csmigrate tracking-wider">
                {evaluation.algorithm_name}
              </span>
              <span className="text-[10px] text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 border border-[#D4FF00]/50 font-black uppercase">
                {evaluation.codename}
              </span>
            </div>
            <p className="text-[11px] text-[#8E98AA] font-sans mt-0.5">
              Architectural Engine: <span className="text-white font-bold">{evaluation.archetype}</span>
            </p>
          </div>
        </div>

        {/* Sandbox Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSandboxEnabled(!sandboxEnabled)}
            className={clsx(
              'px-3 py-1.5 border-2 text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]',
              sandboxEnabled
                ? 'border-[#00F0FF] bg-[#00F0FF] text-black shadow-[2px_2px_0px_0px_#00F0FF]'
                : 'border-white/25 bg-[#0D1117] text-[#8E98AA] hover:text-white hover:border-white/50'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{sandboxEnabled ? '🧪 SANDBOX ACTIVE' : '🧪 TWEAK IN SANDBOX'}</span>
          </button>
        </div>
      </div>

      {/* 2. Algorithmic Reach & Compatibility Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0A0D14] border-2 border-white/15 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#646E82] uppercase tracking-wider font-bold">
            ALGORITHM COMPATIBILITY SCORE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={clsx(
                'text-3xl font-black font-mechanismo',
                evaluation.overall_compatibility_score >= 75
                  ? 'text-[#D4FF00]'
                  : evaluation.overall_compatibility_score >= 55
                  ? 'text-white'
                  : 'text-[#EF4444]'
              )}
            >
              {evaluation.overall_compatibility_score}
            </span>
            <span className="text-xs text-[#646E82]">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-2 md:pt-0">
          <span className="text-[9px] text-[#646E82] uppercase tracking-wider font-bold">
            PROJECTED DISTRIBUTION TIER
          </span>
          <span className="text-sm font-black text-[#00FF41] uppercase font-csmigrate mt-1">
            {evaluation.predicted_reach_tier}
          </span>
        </div>

        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-2 md:pt-0">
          <span className="text-[9px] text-[#646E82] uppercase tracking-wider font-bold">
            ESTIMATED IMPRESSIONS
          </span>
          <span className="text-sm font-black text-[#D4FF00] uppercase font-csmigrate mt-1">
            {evaluation.projected_impressions_estimate}
          </span>
        </div>
      </div>

      {/* 3. Interactive Stage Gate Pipeline (The Real Distribution Engine) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>3-STAGE COHORT DISTRIBUTION PIPELINE</span>
          </div>
          <span className="text-[10px] text-[#8E98AA] uppercase font-sans">
            Batch-Testing Progression Flow
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {evaluation.cohort_stages.map((stage, idx) => {
            const isPassed = stage.passed;
            const isPriorPassed = idx === 0 || evaluation.cohort_stages[idx - 1].passed;

            return (
              <div
                key={stage.stage_name}
                className={clsx(
                  'p-4 border-2 flex flex-col justify-between gap-3 transition-all relative shadow-[3px_3px_0px_0px_#000]',
                  isPassed
                    ? 'border-[#00FF41] bg-[#061208]'
                    : isPriorPassed
                    ? 'border-[#EF4444] bg-[#160608]'
                    : 'border-white/10 bg-[#060709] opacity-60'
                )}
              >
                <div>
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[10px] text-[#A2ABB9] uppercase font-black">
                      STAGE 0{stage.stage_number}
                    </span>
                    <span
                      className={clsx(
                        'px-2 py-0.5 text-[9px] font-black uppercase border',
                        isPassed
                          ? 'border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41]'
                          : isPriorPassed
                          ? 'border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]'
                          : 'border-white/20 text-[#646E82]'
                      )}
                    >
                      {isPassed ? '✓ STAGE PASSED' : isPriorPassed ? '✕ HALTED AT GATE' : 'LOCKED'}
                    </span>
                  </div>

                  {/* Stage Title & Volume */}
                  <h4 className="text-xs font-black text-white uppercase mt-2 font-csmigrate">
                    {stage.stage_name}
                  </h4>
                  <span className="text-[10px] text-[#D4FF00] font-bold block mt-0.5">
                    Cohort Size: {stage.impressions_range}
                  </span>

                  {/* Gate Metric Metric Box */}
                  <div className="mt-3 bg-[#0A0D14] p-2.5 border border-white/15">
                    <div className="flex justify-between items-baseline text-[10px]">
                      <span className="text-[#8E98AA] font-bold">{stage.gate_metric_name}</span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={clsx(
                            'font-black text-xs',
                            isPassed ? 'text-[#00FF41]' : 'text-[#EF4444]'
                          )}
                        >
                          {stage.gate_actual_value}
                          {stage.unit || '%'}
                        </span>
                        <span className="text-[9px] text-[#646E82]">
                          / req {stage.gate_target_threshold}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black/60 border border-white/10 mt-1.5 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            (stage.gate_actual_value / stage.gate_target_threshold) * 100
                          )}%`,
                        }}
                        className={clsx(
                          'h-full transition-all duration-500',
                          isPassed ? 'bg-[#00FF41]' : 'bg-[#EF4444]'
                        )}
                      />
                    </div>
                  </div>

                  {/* Algorithmic Reason */}
                  <p className="text-[11px] text-[#DDE2EA] font-sans mt-2.5 leading-relaxed">
                    {stage.verdict_reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Metric Sandbox Controls (When Expanded) */}
      {sandboxEnabled && (
        <div className="bg-[#0C0F16] border-2 border-[#00F0FF] p-5 flex flex-col gap-4 shadow-[4px_4px_0px_0px_#00F0FF]">
          <div className="flex items-center justify-between border-b border-[#00F0FF]/30 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs font-black text-white uppercase font-csmigrate">
                LIVE ALGORITHM SANDBOX // SIMULATE PARAMETER CHANGES
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetSandbox}
              className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET DEFAULTS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hook Slider */}
            <div className="flex flex-col gap-1.5 bg-[#060709] p-3 border border-white/10">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E98AA] font-bold">0-3s STOP-SCROLL HOOK</span>
                <span className="text-[#D4FF00] font-black">{sandboxInputs.hookPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="98"
                value={sandboxInputs.hookPct}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, hookPct: parseInt(e.target.value) })
                }
                className="accent-[#D4FF00] cursor-pointer"
              />
            </div>

            {/* Retention Slider */}
            <div className="flex flex-col gap-1.5 bg-[#060709] p-3 border border-white/10">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E98AA] font-bold">WATCH-THROUGH / APV</span>
                <span className="text-[#00FF41] font-black">{sandboxInputs.retentionPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="98"
                value={sandboxInputs.retentionPct}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, retentionPct: parseInt(e.target.value) })
                }
                className="accent-[#00FF41] cursor-pointer"
              />
            </div>

            {/* DM / Share Slider */}
            <div className="flex flex-col gap-1.5 bg-[#060709] p-3 border border-white/10">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E98AA] font-bold">DM SHARE VELOCITY</span>
                <span className="text-[#FF0055] font-black">{sandboxInputs.sharePct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="98"
                value={sandboxInputs.sharePct}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, sharePct: parseInt(e.target.value) })
                }
                className="accent-[#FF0055] cursor-pointer"
              />
            </div>

            {/* Engagement / Debate Slider */}
            <div className="flex flex-col gap-1.5 bg-[#060709] p-3 border border-white/10">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E98AA] font-bold">COMMENT / DEBATE DENSITY</span>
                <span className="text-[#00F0FF] font-black">{sandboxInputs.engagementPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="98"
                value={sandboxInputs.engagementPct}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, engagementPct: parseInt(e.target.value) })
                }
                className="accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Signal Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 p-2 bg-[#060709] border border-white/10 cursor-pointer text-[10px]">
              <input
                type="checkbox"
                checked={sandboxInputs.hasOutboundLink}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, hasOutboundLink: e.target.checked })
                }
                className="accent-[#EF4444]"
              />
              <span className={sandboxInputs.hasOutboundLink ? 'text-[#EF4444] font-bold' : 'text-[#8E98AA]'}>
                🔗 Outbound Link in Main Body (-40% to -50% Penalty)
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#060709] border border-white/10 cursor-pointer text-[10px]">
              <input
                type="checkbox"
                checked={sandboxInputs.hasWatermark}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, hasWatermark: e.target.checked })
                }
                className="accent-[#EF4444]"
              />
              <span className={sandboxInputs.hasWatermark ? 'text-[#EF4444] font-bold' : 'text-[#8E98AA]'}>
                🏷️ Third-Party Watermark / Logo (-70% Demotion)
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#060709] border border-white/10 cursor-pointer text-[10px]">
              <input
                type="checkbox"
                checked={sandboxInputs.hasLoopEnding}
                onChange={(e) =>
                  setSandboxInputs({ ...sandboxInputs, hasLoopEnding: e.target.checked })
                }
                className="accent-[#00FF41]"
              />
              <span className={sandboxInputs.hasLoopEnding ? 'text-[#00FF41] font-bold' : 'text-[#8E98AA]'}>
                🔄 Seamless Loop / Re-Watch Structure (+12x Multiplier)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 5. Detected Algorithmic Boosts & Penalties Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Boosts */}
        <div className="flex flex-col gap-2.5 p-4 bg-[#08120A] border-2 border-[#00FF41] shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-2 text-xs font-black text-[#00FF41] uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>ACTIVE ALGORITHMIC BOOSTS ({evaluation.detected_boosts.length})</span>
          </div>

          {evaluation.detected_boosts.length === 0 ? (
            <p className="text-[11px] text-[#8E98AA] font-sans italic">
              No platform-specific acceleration signals currently detected.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {evaluation.detected_boosts.map((b) => (
                <div key={b.boost_id} className="bg-black/50 p-2.5 border border-[#00FF41]/40 flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-black text-white font-csmigrate">{b.label}</span>
                    <span className="text-[10px] text-[#00FF41] font-black">{b.multiplier_factor}</span>
                  </div>
                  <p className="text-[10px] text-[#A2ABB9] font-sans leading-tight mt-0.5">{b.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Penalties */}
        <div className="flex flex-col gap-2.5 p-4 bg-[#140608] border-2 border-[#EF4444] shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-2 text-xs font-black text-[#EF4444] uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ACTIVE ALGORITHMIC PENALTIES ({evaluation.detected_penalties.length})</span>
          </div>

          {evaluation.detected_penalties.length === 0 ? (
            <div className="flex items-center gap-2 text-[11px] text-[#00FF41] font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clean specimen. Zero platform suppression flags detected.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {evaluation.detected_penalties.map((p) => (
                <div key={p.penalty_id} className="bg-black/50 p-2.5 border border-[#EF4444]/40 flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-black text-[#EF4444] font-csmigrate">{p.label}</span>
                    <span className="text-[10px] text-[#EF4444] font-black">{p.impact}</span>
                  </div>
                  <p className="text-[10px] text-[#E2E6EC] font-sans leading-tight mt-0.5">{p.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Primary Actionable Fix Banner */}
      <div className="p-4 bg-gradient-to-r from-[#D4FF00]/15 via-[#07080A] to-black border-2 border-[#D4FF00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#D4FF00]">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#D4FF00] shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[9px] text-[#D4FF00] uppercase font-black tracking-wider">
              PRIMARY ALGORITHMIC RECOMMENDATION // HIGHEST LEVERAGE FIX
            </span>
            <p className="text-xs text-white font-sans font-bold mt-0.5 leading-relaxed">
              {evaluation.primary_actionable_fix}
            </p>
          </div>
        </div>

        {onApplyOptimizedFix && (
          <button
            type="button"
            onClick={() => onApplyOptimizedFix(evaluation.primary_actionable_fix)}
            className="px-3 py-1.5 bg-[#D4FF00] text-black font-csmigrate text-xs uppercase font-black border-2 border-black shrink-0 hover:bg-[#b8de00] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            ⚡ APPLY FIX TO SPECIMEN
          </button>
        )}
      </div>
    </div>
  );
};
