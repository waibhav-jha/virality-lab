import React from 'react';
import { ViralityScoreBreakdown } from '../../api/types';
import { ScoreGauge } from '../../design-system/ScoreGauge';
import { MetricBar } from '../../design-system/MetricBar';

interface ViralityScoreSectionProps {
  score: ViralityScoreBreakdown | any;
  optimizedScore?: ViralityScoreBreakdown | any;
}

export const ViralityScoreSection: React.FC<ViralityScoreSectionProps> = ({
  score,
  optimizedScore,
}) => {
  if (!score) return null;

  const normalize = (val?: any): number => {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    if (isNaN(num)) return 0;
    return num <= 1.0 && num > 0 ? Math.round(num * 100) : Math.round(num);
  };

  // Support both backend schema (overall_score, components.retention, etc.) and legacy/mock schema
  const overall = score.overall_score !== undefined
    ? score.overall_score
    : score.calibrated_virality_score !== undefined
    ? score.calibrated_virality_score
    : score.raw_virality_score;

  const calibratedScore = normalize(overall);

  const retention = normalize(
    score.components?.retention !== undefined ? score.components.retention : score.retention_score
  );
  const shareability = normalize(
    score.components?.sharing !== undefined ? score.components.sharing : score.shareability_score
  );
  const engagement = normalize(
    score.components?.engagement !== undefined ? score.components.engagement : score.engagement_score
  );
  const conversion = normalize(
    score.components?.conversion !== undefined ? score.components.conversion : score.conversion_score
  );

  const rawAgreement = score.audience?.agreement?.agreement_score !== undefined
    ? score.audience.agreement.agreement_score
    : score.audience_agreement;
  const agreement = rawAgreement !== undefined ? normalize(rawAgreement) : 75;

  const rawPolarization = score.audience?.agreement?.polarization_score !== undefined
    ? score.audience.agreement.polarization_score
    : score.polarization_index;
  const polarization = rawPolarization !== undefined ? normalize(rawPolarization) : 25;

  const confidence = score.confidence?.simulation_coverage !== undefined
    ? score.confidence.simulation_coverage
    : score.confidence_score !== undefined
    ? score.confidence_score
    : 0.85;

  const getTier = (s: number) => {
    if (s >= 80) return 'BREAKOUT POTENTIAL';
    if (s >= 65) return 'STRONG MOMENTUM';
    if (s >= 45) return 'MODERATE REACH';
    return 'HIGH FRICTION DROP-OFF';
  };

  const performanceTier = score.performance_tier || getTier(calibratedScore);

  // Determine top score drivers
  const dims = [
    { label: 'RETENTION', val: retention },
    { label: 'SHARING', val: shareability },
    { label: 'ENGAGEMENT', val: engagement },
    { label: 'CONVERSION', val: conversion },
  ].sort((a, b) => b.val - a.val);

  const topDrivers = dims.slice(0, 2).map((d) => d.label);

  const getOptScoreComponent = (opt: any, key: 'retention' | 'sharing' | 'engagement' | 'conversion', legacyKey: string) => {
    if (!opt) return undefined;
    if (opt.components && opt.components[key] !== undefined) return normalize(opt.components[key]);
    if (opt[legacyKey] !== undefined) return normalize(opt[legacyKey]);
    return undefined;
  };

  return (
    <section
      className="w-full cyber-card corner-ticks p-6 sm:p-8 text-left flex flex-col gap-6"
      aria-label="Virality potential score and breakdown"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#00FF41]/20 pb-3 font-mechanismo text-[11px] text-[#8E9E90] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-black bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40 shadow-[0_0_6px_rgba(0,255,65,0.2)]">
            02 // AUDIENCE CALIBRATION
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/90 font-bold">VIRALITY POTENTIAL REPORT</span>
        </div>
        <div className="flex items-center gap-2 bg-[#000000] px-2 py-1 border border-[#00FF41]/30 shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[#00F0FF] font-black font-csmigrate">TIER: {performanceTier}</span>
        </div>
      </div>

      {/* Main Score & Dimension Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 5 Columns: Massive Master Gauge */}
        <div className="lg:col-span-5 border-2 border-[#00FF41]/30 bg-[#000000] flex flex-col justify-between shadow-[3px_3px_0px_0px_#000]">
          <ScoreGauge
            score={calibratedScore}
            confidence={confidence}
            percentile={score.percentile_estimate}
            tier={performanceTier}
            size="lg"
          />
          <div className="p-4 border-t-2 border-[#00FF41]/20 font-mechanismo text-xs text-[#8E9E90] bg-[#050805]">
            <span className="text-[#526355] block uppercase text-[10px] font-bold">PRIMARY PERFORMANCE VECTORS:</span>
            <span className="text-[#00FF41] font-black uppercase font-csmigrate text-sm">{topDrivers.join(' + ')}</span>
          </div>
        </div>

        {/* Right 7 Columns: Core Performance Vectors */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4 p-5 sm:p-6 bg-[#000000] border-2 border-[#00FF41]/30 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-[#00FF41]/20 pb-2 font-mechanismo font-bold">
            <span className="text-xs text-white/90 font-csmigrate uppercase tracking-wider">DIMENSION VECTORS</span>
            <span className="text-[10px] text-[#8E9E90]">SCALE 00–100</span>
          </div>

          <div className="flex flex-col gap-4">
            <MetricBar
              label="RETENTION & COMPLETION CADENCE"
              value={retention}
              previousValue={getOptScoreComponent(optimizedScore, 'retention', 'retention_score')}
              color="accent"
              description="Sustained viewer attention through the opening 3-5 second hook window."
            />
            <MetricBar
              label="PEER PROPAGATION & FORWARDING"
              value={shareability}
              previousValue={getOptScoreComponent(optimizedScore, 'sharing', 'shareability_score')}
              color="accent"
              description="Probability of viewer sending specimen via DM or reposting to network."
            />
            <MetricBar
              label="ACTIVE ENGAGEMENT DENSITY"
              value={engagement}
              previousValue={getOptScoreComponent(optimizedScore, 'engagement', 'engagement_score')}
              color="accent"
              description="Frictionless prompt for commentary, controversy, or feedback."
            />
            <MetricBar
              label="CONVERSION & AUDIENCE CAPTURE"
              value={conversion}
              previousValue={getOptScoreComponent(optimizedScore, 'conversion', 'conversion_score')}
              color="accent"
              description="Propensity of first-time viewers to tap profile and subscribe."
            />
          </div>

          {/* Polarization & Consensus Telemetry */}
          <div className="pt-3 border-t-2 border-[#00FF41]/20 flex flex-col gap-2 font-mechanismo">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8E9E90] uppercase font-bold">
                {polarization > 40 ? 'POLARIZATION INDEX' : 'COHORT CONSENSUS'}
              </span>
              <span className="font-black text-[#00FF41]">{agreement}% AGREEMENT</span>
            </div>
            <div className="relative h-2 w-full bg-[#000000] border border-[#00FF41]/30 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
              <div
                className="h-full bg-[#00FF41] shadow-[0_0_8px_#00FF41] transition-all duration-500"
                style={{ width: `${agreement}%` }}
              />
            </div>
            <span className="text-[11px] text-[#8E9E90] font-sans leading-tight">
              {polarization > 40
                ? 'High audience polarization: Content divides cohorts, driving debate at the cost of unified reach.'
                : 'Broad cross-persona consensus: Similar retention signals across diverse audience demographics.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
