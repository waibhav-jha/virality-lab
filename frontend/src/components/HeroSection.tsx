import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Platform } from '../api/types';
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
    <section className="relative w-full border-b-2 border-white/15 pb-8 pt-2 overflow-hidden text-left" aria-label="Experiment Introduction">
      {/* Background wireframe contour lines */}
      <div className="absolute right-0 top-0 w-96 h-48 opacity-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <WaveformContour variant="topography" opacity={0.3} />
      </div>

      {/* Top Cyber Index & Meta Ticks */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/15 pb-3 mb-6 font-mono text-[11px] text-[#8E9E90] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-black bg-[#00FF41]/10 px-2 py-0.5 border border-[#00FF41]/40">
            00 // SPECIMEN INQUIRY
          </span>
          <span className="text-white/40">::</span>
          <span className="text-white font-bold">PRE-PUBLICATION MULTI-AGENT AUDIT</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mechanismo">
          <span className="text-[#00FF41]">SPECIMEN COHORT: 5+ AGENTS</span>
          <span className="text-white/30">|</span>
          <span className="text-[#D4FF00]">CALIBRATION: DETERMINISTIC</span>
        </div>
      </div>

      {/* Main Grid: Left Inquiry × Right Specimen Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Cyber Brutalist Headline */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-astroda font-black text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-wider leading-[1.3] uppercase flex flex-col gap-2 sm:gap-3 overflow-visible">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">WOULD</span>
                <span className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">THEY</span>
              </div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF41] via-[#D4FF00] to-white/90 flex items-center gap-3 sm:gap-4 flex-wrap pb-2 pt-0.5 overflow-visible">
                <span>STOP</span>
                <span>SCROLLING?</span>
              </div>
            </h1>
          </div>

          <div className="flex items-center gap-2 font-csmigrate text-xs uppercase">
            <span className="bg-[#00FF41] text-black font-black px-2 py-0.5 shadow-[2px_2px_0px_#000]">
              SIMULATE WITHOUT GUESSWORK
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white font-bold">PREDICT BEFORE POSTING</span>
          </div>

          <p className="text-xs sm:text-sm text-[#A2B0A5] max-w-xl font-mono leading-relaxed mt-1">
            Simulate your hook, script, video, or caption against an autonomous behavioral panel.
            Diagnose drop-off friction, measure scroll-stop velocity, and synthesize winning variants.
          </p>
        </div>

        {/* Right 5 Columns: Specimen Quick-Picks & Demo Trigger */}
        <div className="lg:col-span-5 flex flex-col gap-3 cyber-card p-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="font-mono text-xs text-white uppercase font-black tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00FF41] inline-block shadow-[0_0_6px_#00FF41]" />
              PRESET SPECIMENS
            </span>
            <span className="font-mechanismo text-[10px] text-[#00FF41] font-bold tracking-wider">
              [CLICK TO INJECT]
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {SAMPLE_DATA.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onLoadSample(sample)}
                className="flex items-center justify-between p-2.5 bg-[#000000] hover:bg-[#0A140A] border border-[#142116] hover:border-[#00FF41] transition-all text-left cursor-pointer group shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#00FF41]"
                aria-label={`Load specimen: ${sample.title}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mechanismo text-[11px] text-[#00FF41]/70 group-hover:text-[#00FF41] font-black">
                    [0{idx + 1}]
                  </span>
                  <span className="text-xs font-bold font-mono text-[#E2E6EC] group-hover:text-white truncate">
                    {sample.title}
                  </span>
                </div>
                <span className="font-mechanismo text-[10px] text-[#00FF41] bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/30 uppercase shrink-0 ml-2 font-bold">
                  {sample.platform}
                </span>
              </button>
            ))}
          </div>

          {onRunDemo && (
            <div className="pt-2.5 border-t border-white/15 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8E9E90] font-bold">INSTANT BENCHMARK:</span>
              <button
                type="button"
                onClick={onRunDemo}
                className="inline-flex items-center gap-2 font-csmigrate text-xs text-black bg-[#00FF41] hover:bg-white font-black px-3 py-1.5 border border-[#00FF41] shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all hover:scale-105"
              >
                <span>RUN DEMO SIMULATION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
