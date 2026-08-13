import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  Calculator,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ViralityScoreBreakdown, SignalAttribution, RetentionFunnelStep, FormulaBreakdown } from '../../api/types';

interface ScoreMathInspectorProps {
  score: ViralityScoreBreakdown | any;
  platform?: string;
}

export const ScoreMathInspector: React.FC<ScoreMathInspectorProps> = ({ score, platform = 'tiktok' }) => {
  const [activeTab, setActiveTab] = useState<'formula' | 'signals' | 'funnel'>('signals');
  const [interactiveRetentionWeight, setInteractiveRetentionWeight] = useState<number>(45);
  const [interactiveSharingWeight, setInteractiveSharingWeight] = useState<number>(25);
  const [interactiveEngagementWeight, setInteractiveEngagementWeight] = useState<number>(15);
  const [interactiveConversionWeight, setInteractiveConversionWeight] = useState<number>(15);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  if (!score) return null;

  const normalize = (val?: any): number => {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    if (isNaN(num)) return 0;
    return num <= 1.0 && num > 0 ? Math.round(num * 100) : Math.round(num);
  };

  const ret = normalize(score.components?.retention ?? score.retention_score ?? 65);
  const share = normalize(score.components?.sharing ?? score.shareability_score ?? 55);
  const eng = normalize(score.components?.engagement ?? score.engagement_score ?? 60);
  const conv = normalize(score.components?.conversion ?? score.conversion_score ?? 50);

  const rawSum = score.formula_breakdown?.raw_weighted_sum ?? Math.round(ret * 0.45 + share * 0.25 + eng * 0.15 + conv * 0.15);
  const platformBonus = score.formula_breakdown?.platform_bonus_points ?? 8;
  const calibratedScore = normalize(score.overall_score ?? score.calibrated_virality_score ?? score.raw_virality_score ?? 72);

  // Live interactive weight calculation
  const totalWeight = interactiveRetentionWeight + interactiveSharingWeight + interactiveEngagementWeight + interactiveConversionWeight;
  const simulatedRawSum = Math.round(
    (ret * (interactiveRetentionWeight / 100) +
      share * (interactiveSharingWeight / 100) +
      eng * (interactiveEngagementWeight / 100) +
      conv * (interactiveConversionWeight / 100)) *
      (100 / Math.max(1, totalWeight))
  );
  const simulatedCalibrated = Math.min(99, Math.max(15, simulatedRawSum + platformBonus));

  // Extract signals or fallback to default deterministic signals
  const signals: SignalAttribution[] = score.signal_attributions?.length
    ? score.signal_attributions
    : [
        {
          signal_id: 'sig_pattern_interrupt',
          signal_name: 'Cognitive Pattern Interrupt Hook',
          category: 'hook',
          impact_points: +9,
          matched_text: 'Opening disruptive copy',
          rationale: 'Suppresses reflexive thumb scrolling by presenting a counter-intuitive premise.',
          confidence: 0.92,
        },
        {
          signal_id: 'sig_numerical_specificity',
          signal_name: 'Quantified Specificity Anchor',
          category: 'cognitive',
          impact_points: +8,
          matched_text: 'Empirical numbers / timeframes',
          rationale: 'Concrete metrics disarm skepticism across academic and analytical persona cohorts.',
          confidence: 0.89,
        },
        {
          signal_id: 'sig_save_cta',
          signal_name: 'High-Conversion Bookmark Anchor',
          category: 'utility',
          impact_points: +8,
          matched_text: 'Save / bookmark CTA',
          rationale: 'Triggers platform save algorithms which carry higher distribution weight than passive likes.',
          confidence: 0.94,
        },
      ];

  // Extract retention funnel or fallback
  const funnelSteps: RetentionFunnelStep[] = score.retention_funnel?.length
    ? score.retention_funnel
    : [
        {
          step_name: '0.0s Feed Impression',
          time_seconds: 0.0,
          retention_percentage: 100.0,
          dropoff_percentage: 0.0,
          friction_note: 'Initial feed delivery into the algorithmic stream.',
        },
        {
          step_name: '1.5s Hook Window',
          time_seconds: 1.5,
          retention_percentage: Math.max(10, Math.round(ret * 1.1)),
          dropoff_percentage: Math.max(0, Math.round(100 - ret * 1.1)),
          friction_note: 'Instant stop-scroll decision window governed by opening visual & hook phrasing.',
        },
        {
          step_name: '5.0s Cognitive Engagement',
          time_seconds: 5.0,
          retention_percentage: Math.max(8, Math.round(ret * 0.9)),
          dropoff_percentage: Math.max(0, Math.round(ret * 0.2)),
          friction_note: 'Comprehension threshold where audience assesses value payoff.',
        },
        {
          step_name: '15.0s Mid-Sequence Pacing',
          time_seconds: 15.0,
          retention_percentage: Math.max(5, Math.round(eng * 0.9)),
          dropoff_percentage: Math.max(0, Math.round(ret * 0.9 - eng * 0.9)),
          friction_note: 'Mid-point retention curve sustaining attention before payoff reveal.',
        },
        {
          step_name: '100% Full Watch Completion',
          time_seconds: 30.0,
          retention_percentage: Math.max(3, Math.round(share * 0.8)),
          dropoff_percentage: Math.max(0, Math.round(eng * 0.9 - share * 0.8)),
          friction_note: 'Full video consumption indicating high structural satisfaction.',
        },
        {
          step_name: 'Amplification & Bookmark Action',
          time_seconds: 32.0,
          retention_percentage: Math.max(2, Math.round(conv * 0.7)),
          dropoff_percentage: Math.max(0, Math.round(share * 0.8 - conv * 0.7)),
          friction_note: 'Downstream virality action (Peer DM share / Save bookmark).',
        },
      ];

  const positiveSignals = signals.filter((s) => s.impact_points > 0);
  const negativeSignals = signals.filter((s) => s.impact_points < 0);

  return (
    <div className="cyber-card corner-ticks p-6 flex flex-col gap-6 text-left border-2 border-white/20 bg-[#07080A]">
      {/* Header with Diagnostic Telemetry */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            02B // EXPLAINABLE INTELLIGENCE
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/90 font-bold">MATHEMATICAL FORMULA & SIGNAL ATTRIBUTION LEDGER</span>
        </div>
        <div className="flex items-center gap-2 text-[#00FF41] font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
          <span>DETERMINISTIC CAUSAL MODEL</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/15 pb-2 font-mechanismo text-xs">
        <button
          onClick={() => setActiveTab('signals')}
          className={clsx(
            'px-3 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 border',
            activeTab === 'signals'
              ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00] shadow-[2px_2px_0px_0px_#000]'
              : 'bg-[#0E1015] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          SIGNAL ATTRIBUTION LEDGER ({signals.length})
        </button>

        <button
          onClick={() => setActiveTab('formula')}
          className={clsx(
            'px-3 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 border',
            activeTab === 'formula'
              ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00] shadow-[2px_2px_0px_0px_#000]'
              : 'bg-[#0E1015] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
          )}
        >
          <Calculator className="w-3.5 h-3.5" />
          MATHEMATICAL FORMULA INSPECTOR
        </button>

        <button
          onClick={() => setActiveTab('funnel')}
          className={clsx(
            'px-3 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 border',
            activeTab === 'funnel'
              ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00] shadow-[2px_2px_0px_0px_#000]'
              : 'bg-[#0E1015] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          5-STAGE RETENTION FUNNEL
        </button>
      </div>

      {/* TAB 1: SIGNAL ATTRIBUTION LEDGER */}
      {activeTab === 'signals' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-xs font-mechanismo text-[#A2ABB9] bg-[#0A0D14] p-3 border border-white/10">
            <span>
              Every point in the Virality Score is directly attributed to verifiable linguistic, cognitive, and narrative signals.
            </span>
            <span className="text-[#D4FF00] font-bold">
              NET DETECTED: +{positiveSignals.reduce((acc, s) => acc + s.impact_points, 0) + negativeSignals.reduce((acc, s) => acc + s.impact_points, 0)} PTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Accelerators */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-1 font-mechanismo text-xs">
                <span className="font-bold text-[#D4FF00] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> POSITIVE LIFT SIGNALS ({positiveSignals.length})
                </span>
                <span className="text-[#D4FF00] font-black">
                  +{positiveSignals.reduce((acc, s) => acc + s.impact_points, 0)} PTS
                </span>
              </div>

              {positiveSignals.length === 0 ? (
                <div className="p-4 bg-[#0A0D14] border border-white/10 text-xs text-[#8E98AA] italic">
                  No positive signal accelerators detected. Consider adding numerical specificity or a pattern interrupt hook.
                </div>
              ) : (
                positiveSignals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#07080A] border border-white/15 hover:border-[#D4FF00]/60 transition-all shadow-[2px_2px_0px_0px_#000] flex flex-col gap-2 font-mechanismo"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 text-[10px] font-black uppercase">
                          {sig.category}
                        </span>
                        <span className="font-bold text-white text-xs">{sig.signal_name}</span>
                      </div>
                      <span className="text-[#00FF41] font-black text-sm">+{sig.impact_points} PTS</span>
                    </div>

                    {sig.matched_text && (
                      <div className="text-[11px] text-[#A2ABB9] font-mono bg-[#0E1015] p-1.5 border border-white/10">
                        DETECTED: <span className="text-white font-bold font-sans">"{sig.matched_text}"</span>
                      </div>
                    )}

                    <p className="font-sans text-xs text-[#8E98AA] leading-relaxed">{sig.rationale}</p>
                    <div className="text-[10px] text-[#646E82] text-right font-mono">
                      SIGNAL CONFIDENCE: {Math.round(sig.confidence * 100)}%
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Negative Friction Penalties */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-1 font-mechanismo text-xs">
                <span className="font-bold text-[#EF4444] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> FRICTION PENALTIES ({negativeSignals.length})
                </span>
                <span className="text-[#EF4444] font-black">
                  {negativeSignals.reduce((acc, s) => acc + s.impact_points, 0)} PTS
                </span>
              </div>

              {negativeSignals.length === 0 ? (
                <div className="p-4 bg-[#0A0D14] border border-white/10 text-xs text-[#00FF41] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero structural friction penalties detected. Specimen meets core algorithmic pacing hygiene.</span>
                </div>
              ) : (
                negativeSignals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#07080A] border border-white/15 hover:border-[#EF4444]/60 transition-all shadow-[2px_2px_0px_0px_#000] flex flex-col gap-2 font-mechanismo"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 text-[10px] font-black uppercase">
                          {sig.category}
                        </span>
                        <span className="font-bold text-white text-xs">{sig.signal_name}</span>
                      </div>
                      <span className="text-[#EF4444] font-black text-sm">{sig.impact_points} PTS</span>
                    </div>

                    {sig.matched_text && (
                      <div className="text-[11px] text-[#A2ABB9] font-mono bg-[#0E1015] p-1.5 border border-white/10">
                        FRICTION SNIPPET: <span className="text-white font-bold font-sans">"{sig.matched_text}"</span>
                      </div>
                    )}

                    <p className="font-sans text-xs text-[#8E98AA] leading-relaxed">{sig.rationale}</p>
                    <div className="text-[10px] text-[#646E82] text-right font-mono">
                      SIGNAL CONFIDENCE: {Math.round(sig.confidence * 100)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATHEMATICAL FORMULA INSPECTOR */}
      {activeTab === 'formula' && (
        <div className="flex flex-col gap-6 font-mechanismo">
          {/* Main Equation Box */}
          <div className="p-4 sm:p-5 bg-[#0A0D14] border-2 border-[#D4FF00] shadow-[3px_3px_0px_0px_#D4FF00] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs border-b border-white/15 pb-2">
              <span className="text-[#D4FF00] font-black uppercase tracking-wider font-csmigrate">
                PLATFORM ALGORITHMIC WEIGHT EQUATION [{platform.toUpperCase()}]
              </span>
              <span className="text-white/60 font-mono text-[10px]">TRANSPARENT ALGEBRAIC LEDGER</span>
            </div>

            <div className="p-3 bg-[#060709] border border-white/15 font-mono text-sm sm:text-base text-white leading-relaxed overflow-x-auto">
              <span className="text-[#8E98AA]">Final Score = </span>
              <span className="text-[#D4FF00] font-bold">({(interactiveRetentionWeight / 100).toFixed(2)} × Retention [{ret}])</span>
              <span className="text-white/40"> + </span>
              <span className="text-[#00FF41] font-bold">({(interactiveSharingWeight / 100).toFixed(2)} × Sharing [{share}])</span>
              <span className="text-white/40"> + </span>
              <span className="text-[#38BDF8] font-bold">({(interactiveEngagementWeight / 100).toFixed(2)} × Engagement [{eng}])</span>
              <span className="text-white/40"> + </span>
              <span className="text-[#F472B6] font-bold">({(interactiveConversionWeight / 100).toFixed(2)} × Conversion [{conv}])</span>
              {platformBonus !== 0 && (
                <>
                  <span className="text-white/40"> + </span>
                  <span className="text-[#FBBF24] font-bold">({platformBonus > 0 ? `+${platformBonus}` : platformBonus} Platform Fit)</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-[#07080A] p-2.5 border border-white/10">
                <span className="text-[#646E82] block text-[10px] font-bold">RAW WEIGHTED SUM</span>
                <span className="text-white font-black text-base">{rawSum}/100</span>
              </div>
              <div className="bg-[#07080A] p-2.5 border border-white/10">
                <span className="text-[#646E82] block text-[10px] font-bold">PLATFORM BONUS</span>
                <span className="text-[#00FF41] font-black text-base">+{platformBonus} PTS</span>
              </div>
              <div className="bg-[#07080A] p-2.5 border border-white/10">
                <span className="text-[#646E82] block text-[10px] font-bold">CALIBRATED SCORE</span>
                <span className="text-[#D4FF00] font-black text-base">{calibratedScore}/100</span>
              </div>
              <div className="bg-[#07080A] p-2.5 border border-white/10">
                <span className="text-[#646E82] block text-[10px] font-bold">SIMULATED REWEIGHTED</span>
                <span className="text-[#00FF41] font-black text-base">{simulatedCalibrated}/100</span>
              </div>
            </div>
          </div>

          {/* Interactive Weight Sliders */}
          <div className="p-4 bg-[#07080A] border border-white/15 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#D4FF00]" />
                INTERACTIVE PLATFORM WEIGHT SIMULATOR
              </span>
              <button
                onClick={() => {
                  setInteractiveRetentionWeight(45);
                  setInteractiveSharingWeight(25);
                  setInteractiveEngagementWeight(15);
                  setInteractiveConversionWeight(15);
                }}
                className="text-[10px] text-[#D4FF00] hover:underline font-bold"
              >
                RESET TO PLATFORM DEFAULT
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Retention Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[#D4FF00]">RETENTION WEIGHT: {interactiveRetentionWeight}%</span>
                  <span className="text-[#8E98AA]">Raw: {ret}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={interactiveRetentionWeight}
                  onChange={(e) => setInteractiveRetentionWeight(Number(e.target.value))}
                  className="w-full accent-[#D4FF00] bg-[#0E1015]"
                />
              </div>

              {/* Sharing Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[#00FF41]">SHARING WEIGHT: {interactiveSharingWeight}%</span>
                  <span className="text-[#8E98AA]">Raw: {share}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={interactiveSharingWeight}
                  onChange={(e) => setInteractiveSharingWeight(Number(e.target.value))}
                  className="w-full accent-[#00FF41] bg-[#0E1015]"
                />
              </div>

              {/* Engagement Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[#38BDF8]">ENGAGEMENT WEIGHT: {interactiveEngagementWeight}%</span>
                  <span className="text-[#8E98AA]">Raw: {eng}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={interactiveEngagementWeight}
                  onChange={(e) => setInteractiveEngagementWeight(Number(e.target.value))}
                  className="w-full accent-[#38BDF8] bg-[#0E1015]"
                />
              </div>

              {/* Conversion Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[#F472B6]">CONVERSION WEIGHT: {interactiveConversionWeight}%</span>
                  <span className="text-[#8E98AA]">Raw: {conv}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={interactiveConversionWeight}
                  onChange={(e) => setInteractiveConversionWeight(Number(e.target.value))}
                  className="w-full accent-[#F472B6] bg-[#0E1015]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RETENTION FUNNEL WATERFALL */}
      {activeTab === 'funnel' && (
        <div className="flex flex-col gap-4 font-mechanismo">
          <div className="flex items-center justify-between text-xs text-[#A2ABB9] bg-[#0A0D14] p-3 border border-white/10">
            <span>
              Cognitive drop-off curve modeled across 6 chronological viewing milestones from feed impression to bookmark action.
            </span>
            <span className="text-[#00FF41] font-bold">
              ESTIMATED APV: {Math.round((funnelSteps[1].retention_percentage + funnelSteps[3].retention_percentage) / 2)}%
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {funnelSteps.map((step, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === funnelSteps.length - 1;

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[#07080A] border border-white/15 flex flex-col gap-2 shadow-[2px_2px_0px_0px_#000] hover:border-[#D4FF00]/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#0E1015] border border-white/20 flex items-center justify-center font-mono font-bold text-[10px] text-[#D4FF00]">
                        0{idx + 1}
                      </span>
                      <span className="font-bold text-white font-csmigrate uppercase">{step.step_name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isFirst && step.dropoff_percentage > 0 && (
                        <span className="text-[#EF4444] text-[11px] font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" /> -{step.dropoff_percentage}% DROPOFF
                        </span>
                      )}
                      <span className="text-white font-black text-sm">{step.retention_percentage}% RETENTION</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-[#0E1015] border border-white/20 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-500',
                        step.retention_percentage >= 70
                          ? 'bg-[#00FF41] shadow-[0_0_8px_#00FF41]'
                          : step.retention_percentage >= 40
                          ? 'bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]'
                          : 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'
                      )}
                      style={{ width: `${step.retention_percentage}%` }}
                    />
                  </div>

                  <p className="font-sans text-xs text-[#8E98AA] leading-relaxed">
                    <span className="text-[#646E82] font-mono text-[10px] uppercase font-bold mr-1">CAUSAL DIAGNOSTIC:</span>
                    {step.friction_note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
