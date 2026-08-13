import React from 'react';
import { Play, Volume2, Eye } from 'lucide-react';
import { Platform } from '../../api/types';
import { WaveformContour } from '../../components/WaveformContour';

interface SocialPreviewProps {
  platform: Platform;
  caption: string;
  mediaUrl?: string;
  mediaType: string;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  platform,
  caption,
  mediaUrl,
  mediaType,
}) => {
  const getPlatformMeta = () => {
    switch (platform) {
      case 'tiktok':
        return { label: 'TIKTOK ALGORITHM SIMULATOR', ratio: '9:16 VERTICAL', targetSec: '< 30s' };
      case 'instagram':
        return { label: 'INSTAGRAM REELS SIMULATOR', ratio: '9:16 VERTICAL', targetSec: '< 60s' };
      case 'youtube':
        return { label: 'YOUTUBE SHORTS SIMULATOR', ratio: '9:16 VERTICAL', targetSec: '< 60s' };
      case 'x':
        return { label: 'X / TWITTER FEED SIMULATOR', ratio: 'INLINE SPECIMEN', targetSec: 'INSTANT' };
      case 'linkedin':
        return { label: 'LINKEDIN FEED SIMULATOR', ratio: 'LONG-FORM TEXT', targetSec: 'DWELL TIME' };
      default:
        return { label: 'UNIVERSAL SOCIAL SPECIMEN', ratio: 'VARIABLE', targetSec: 'STANDARD' };
    }
  };

  const meta = getPlatformMeta();
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;
  const charCount = caption.length;

  return (
    <div className="w-full flex flex-col gap-2 text-left" aria-label="Specimen Examination Monitor">
      {/* Viewport Telemetry Header */}
      <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-2 font-mono-tech text-[10px] text-[#8E9E90] uppercase">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] font-bold">SPECIMEN MONITOR</span>
          <span>::</span>
          <span className="text-white/80">{meta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 bg-[#00FF41]/10 border border-[#00FF41]/30 text-white">
            {meta.ratio}
          </span>
        </div>
      </div>

      {/* Laboratory Specimen Screen */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[9/14] max-h-[500px] bg-[#000000] border border-[#00FF41]/30 corner-ticks overflow-hidden flex flex-col justify-between p-4 shadow-[0_0_20px_rgba(0,255,65,0.15)]">
        {/* Top Wireframe overlay & Timecode */}
        <div className="relative z-20 flex items-center justify-between font-mono-tech text-[10px] text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00FF41] animate-pulse shadow-[0_0_6px_#00FF41]" />
            <span className="text-white font-semibold">FEED_LIVE_STREAM</span>
          </div>
          <div className="flex items-center gap-2 text-[#8E9E90]">
            <span>TC: 00:00:03:12</span>
            <span>|</span>
            <span className="text-[#00FF41]">HOOK EVAL</span>
          </div>
        </div>

        {/* Media Background Content or Typography Grid */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[#000000]">
          {mediaUrl ? (
            mediaType === 'short_video' ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover opacity-85"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={mediaUrl} alt="Specimen creative asset" className="w-full h-full object-cover opacity-85" />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative">
              <WaveformContour variant="topography" opacity={0.18} className="w-full max-w-xs mb-4" />
              <span className="font-mono-tech text-xs text-[#8E9E90] uppercase tracking-wider max-w-[240px]">
                NO MEDIA ATTACHED // EVALUATING HOOK & TRANSCRIPT PROFILE
              </span>
            </div>
          )}
          {/* Subtle Dark Vignette for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/40 to-[#000000]/60 pointer-events-none" />
        </div>

        {/* Specimen Inspection Overlay */}
        <div className="relative z-20 flex flex-col gap-2 mt-auto">
          {/* Diagnostic Parameter Pill */}
          <div className="flex items-center gap-2 font-mono-tech text-[9px] text-[#8E9E90] uppercase">
            <span className="bg-[#00FF41]/15 border border-[#00FF41]/30 px-1.5 py-0.5 text-white">TARGET: {meta.targetSec}</span>
            <span>·</span>
            <span>{wordCount} WORDS</span>
            <span>·</span>
            <span>{charCount} CHARACTERS</span>
          </div>

          {/* Rendered Caption / Script Specimen */}
          <div className="bg-[#000000]/90 backdrop-blur-xs border border-[#00FF41]/30 p-3 max-h-36 overflow-y-auto shadow-[2px_2px_0px_0px_#000]">
            <p className="text-xs sm:text-sm text-[#F4F6F8] font-sans leading-relaxed">
              {caption.trim() ? (
                caption
              ) : (
                <span className="text-[#526355] font-mono-tech text-xs italic">
                  &lt; Input caption or hook script in parameters panel to initiate specimen analysis &gt;
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
