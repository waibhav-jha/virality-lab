import React from 'react';
import { Play, Beaker, ArrowRight } from 'lucide-react';
import { Platform } from '../api/types';
import { Button } from '../design-system/Button';
import { WaveformContour } from './WaveformContour';

export interface SampleContent {
  title: string;
  category: string;
  platform: Platform;
  caption: string;
  mediaType: 'short_video' | 'image';
  goal: 'overall' | 'retention' | 'shares';
}

export const SAMPLE_DATA: SampleContent[] = [
  {
    title: 'AI Engineering 10h/Week Fix',
    category: 'Software & Productivity',
    platform: 'tiktok',
    caption: 'Stop scrolling: If you are still writing boilerplate by hand in 2026, these 3 LLM workflow patterns will save you 10 hours every week. #ai #developer #productivity #tech',
    mediaType: 'short_video',
    goal: 'overall',
  },
  {
    title: 'Biomechanical Pushup Fix',
    category: 'Kinetic Performance',
    platform: 'instagram',
    caption: 'If you can\'t perform 10 strict deficit pushups, stop doing this scapular winging mistake immediately. Here is the exact 2-step cue breakdown. #fitness #calisthenics #biomechanics',
    mediaType: 'short_video',
    goal: 'retention',
  },
  {
    title: 'SaaS Simulation Framework',
    category: 'Autonomous Systems',
    platform: 'x',
    caption: 'We spent 6 months building an autonomous audience simulator for content creators. Today we are releasing the complete architecture and test benchmarks. 🧵👇 #buildinpublic #startups #ai',
    mediaType: 'image',
    goal: 'shares',
  },
];

interface HeroSectionProps {
  onLoadSample: (sample: SampleContent) => void;
  onRunDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLoadSample, onRunDemo }) => {
  return (
    <section className="relative w-full border-b border-white/10 pb-8 pt-2 overflow-hidden text-left" aria-label="Experiment Introduction">
      {/* Background wireframe contour lines */}
      <div className="absolute right-0 top-0 w-96 h-48 opacity-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <WaveformContour variant="topography" opacity={0.3} />
      </div>

      {/* Top Editorial Index & Meta Ticks */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 mb-6 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#D4FF00] font-bold">00 // INQUIRY</span>
          <span>::</span>
          <span>PRE-PUBLICATION MULTI-AGENT CONTENT AUDIT</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>SPECIMEN COHORT: 5 AGENTS</span>
          <span>|</span>
          <span>SAMPLE RATE: 100% DETERMINISTIC</span>
        </div>
      </div>

      {/* Main Editorial Grid: Left Inquiry × Right Specimen Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Architectural Editorial Headline */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05] uppercase">
            WOULD THEY <br />
            <span className="text-white/40">STOP SCROLLING?</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9DA7B8] max-w-xl font-mono-tech leading-relaxed">
            Feed any hook, script, video, or image into a calibrated 5-persona autonomous audience panel.
            Diagnose micro-friction, measure scroll-stop friction, and synthesize optimized variants.
          </p>
        </div>

        {/* Right 5 Columns: Specimen Quick-Picks & Demo Trigger */}
        <div className="lg:col-span-5 flex flex-col gap-3 bg-white/[0.02] border border-white/10 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="tech-label text-[10px] text-white/50">PRESET SPECIMENS</span>
            <span className="font-mono-tech text-[9px] text-[#D4FF00]">SELECT TO LOAD</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {SAMPLE_DATA.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onLoadSample(sample)}
                className="flex items-center justify-between p-2 bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/20 transition-all text-left cursor-pointer group"
                aria-label={`Load specimen: ${sample.title}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono-tech text-[10px] text-white/40 group-hover:text-[#D4FF00]">
                    [0{idx + 1}]
                  </span>
                  <span className="text-xs font-semibold text-[#E2E6EC] group-hover:text-white truncate">
                    {sample.title}
                  </span>
                </div>
                <span className="font-mono-tech text-[10px] text-[#7E8798] uppercase shrink-0 ml-2">
                  {sample.platform}
                </span>
              </button>
            ))}
          </div>

          {onRunDemo && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono-tech text-[10px] text-[#7E8798]">INSTANT BENCHMARK:</span>
              <button
                type="button"
                onClick={onRunDemo}
                className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] text-[#D4FF00] hover:text-[#E2FF44] font-bold cursor-pointer"
              >
                <span>RUN DEMO EXPERIMENT</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
