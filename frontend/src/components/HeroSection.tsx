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
    <section className="relative w-full border-b-2 border-[#00FF41]/20 pb-4 pt-1 overflow-hidden text-left" aria-label="Experiment Introduction">
      {/* Background wireframe contour lines */}
      <div className="absolute right-0 top-0 w-80 h-36 opacity-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <WaveformContour variant="topography" opacity={0.3} />
      </div>

      {/* Top Cyber Index & Meta Ticks */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#00FF41]/20 pb-2 mb-3 font-mechanismo text-[10px] text-[#8E9E90] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-black bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40 shadow-[0_0_6px_rgba(0,255,65,0.2)]">
            00 // INQUIRY
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white/90 font-bold">PRE-PUBLICATION MULTI-AGENT AUDIT</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[9px]">
          <span className="text-[#00F0FF]">SPECIMEN COHORT: 5+ AGENTS</span>
          <span className="text-white/30">|</span>
          <span className="text-[#00FF41]">CALIBRATION: DETERMINISTIC</span>
        </div>
      </div>

      {/* Main Grid: Left Inquiry × Right Specimen Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
        {/* Left 7 Columns: Cyber Brutalist Headline */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <h1 className="font-astroda font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-wider leading-none uppercase flex flex-col gap-1.5 overflow-visible">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span>WOULD</span>
              <span>THEY</span>
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF41] via-[#00F0FF] to-white/80 flex items-center gap-2.5 flex-wrap pb-1 pt-0.5 overflow-visible">
              <span>STOP</span>
              <span>SCROLLING?</span>
            </div>
          </h1>
          <p className="text-xs text-[#8E9E90] max-w-xl font-mechanismo leading-snug">
            Simulate your hook, script, video, or caption against an autonomous behavioral panel.
            Diagnose drop-off friction, measure scroll-stop velocity, and synthesize winning variants.
          </p>
        </div>

        {/* Right 5 Columns: Specimen Quick-Picks & Demo Trigger */}
        <div className="lg:col-span-5 flex flex-col gap-2 cyber-card corner-ticks p-3">
          <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-1.5">
            <span className="font-csmigrate text-[11px] text-white/90 uppercase font-black tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00FF41] inline-block shadow-[0_0_6px_#00FF41]" />
              PRESET SPECIMENS
            </span>
            <span className="font-mechanismo text-[9px] text-[#00FF41] font-bold tracking-wider">
              [CLICK TO INJECT]
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {SAMPLE_DATA.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onLoadSample(sample)}
                className="group w-full p-2 bg-[#000000] border border-[#00FF41]/20 hover:border-[#00FF41] hover:bg-[#00FF41]/10 text-left transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer shadow-[1px_1px_0px_0px_#000]"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-csmigrate text-xs text-white font-bold group-hover:text-[#00FF41] transition-colors truncate">
                      {sample.title}
                    </span>
                    <span className="font-mechanismo text-[8px] uppercase px-1 py-0.2 bg-[#000000] border border-[#00FF41]/30 text-[#00FF41]">
                      {sample.platform}
                    </span>
                  </div>
                  <span className="font-mono-tech text-[9px] text-[#8E9E90] truncate">
                    {sample.category} • {sample.mediaType}
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-[#8E9E90] group-hover:text-[#00FF41] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>

          {/* Quick Demo Run CTA */}
          {onRunDemo && (
            <div className="pt-1.5 border-t border-[#00FF41]/20 flex items-center justify-between gap-2">
              <span className="font-mechanismo text-[9px] text-[#8E9E90] uppercase">
                INSTANT BENCHMARK DEMO
              </span>
              <Button
                variant="viral"
                size="sm"
                className="py-1 px-3 text-xs"
                leftIcon={<Play className="w-3 h-3 fill-current" />}
                onClick={onRunDemo}
              >
                RUN COMPLETE SUITE
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
