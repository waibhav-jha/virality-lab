import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Flame,
  HelpCircle,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';
import { Platform, ViralHookCandidate } from '../../api/types';
import { Button } from '../../design-system/Button';

interface ViralHookGeneratorProps {
  caption: string;
  platform: Platform;
  onApplyHook: (hookText: string) => void;
  disabled?: boolean;
}

export const ViralHookGenerator: React.FC<ViralHookGeneratorProps> = ({
  caption,
  platform,
  onApplyHook,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hooks, setHooks] = useState<ViralHookCandidate[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateHooks = () => {
    setIsGenerating(true);
    setIsOpen(true);

    setTimeout(() => {
      const topic = caption.trim()
        ? caption.replace(/#\w+/g, '').slice(0, 50).trim()
        : 'AI productivity and study workflows';

      const cleanTopic = topic.length > 5 ? topic : 'study and productivity tools';

      let platformTag = `#${platform}`;
      if (platform === 'tiktok') platformTag = '#tiktoktips #viral #learnontiktok';
      else if (platform === 'instagram') platformTag = '#reelsgrowth #explorepage #productivity';
      else if (platform === 'youtube') platformTag = '#shorts #trending #techtips';
      else if (platform === 'x') platformTag = '#buildinpublic #productivity #ai';
      else if (platform === 'linkedin') platformTag = '#leadership #productivity #innovation';

      const generated: ViralHookCandidate[] = [
        {
          id: 'hook_contrarian',
          archetype: 'contrarian',
          archetype_label: 'POLARIZING CONTRARIAN',
          hook_text: `Stop scrolling: Most people are doing ${cleanTopic} completely backwards. Here is what the top 1% actually do instead: ${platformTag}`,
          predicted_stop_scroll: 94,
          angle_summary: 'Challenges status quo, sparks counter-intuitive curiosity and comment debate.',
        },
        {
          id: 'hook_framework',
          archetype: 'curiosity_framework',
          archetype_label: 'NUMBERED CURIOSITY FRAMEWORK',
          hook_text: `3 underrated hacks for ${cleanTopic} that saved me 15 hours this week (and #2 feels almost illegal). Save this for later! ${platformTag}`,
          predicted_stop_scroll: 91,
          angle_summary: 'Anchors specific numerical payoff and high-utility bookmark trigger.',
        },
        {
          id: 'hook_story',
          archetype: 'story_transformation',
          archetype_label: 'TRANSFORMATION STORY',
          hook_text: `I spent 6 months struggling with ${cleanTopic} until I made this 1 simple shift. Here’s the step-by-step breakdown: ${platformTag}`,
          predicted_stop_scroll: 88,
          angle_summary: 'Leverages personal vulnerability and high-stakes transformation payoff.',
        },
      ];

      setHooks(generated);
      setIsGenerating(false);
    }, 300);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-3 font-mono-tech">
      {/* Trigger Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={disabled || isGenerating}
          onClick={generateHooks}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4FF00]/10 border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/20 hover:border-[#D4FF00] transition-colors text-xs font-bold uppercase cursor-pointer"
        >
          <Sparkles className={clsx('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
          <span>⚡ DRAFT 3 VIRAL HOOKS (AI ASSISTANT)</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[10px] text-[#7E8798] hover:text-white uppercase"
          >
            [HIDE ASSISTANT]
          </button>
        )}
      </div>

      {/* Generated Hooks Drawer / Container */}
      {isOpen && (
        <div className="bg-[#0E1013] border border-[#D4FF00]/30 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-[#7E8798] uppercase">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#D4FF00]" />
              AI HOOK SYNTHESIZER · TARGETING {platform.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={generateHooks}
              className="text-[#D4FF00] hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <RefreshCw className={clsx('w-3 h-3', isGenerating && 'animate-spin')} />
              RE-GENERATE
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {hooks.map((h) => (
              <div
                key={h.id}
                className="bg-black/60 border border-white/10 p-3 flex flex-col justify-between gap-2.5 hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <span className="font-bold text-[#D4FF00] uppercase bg-[#D4FF00]/10 px-1.5 py-0.2 border border-[#D4FF00]/20">
                      {h.archetype_label}
                    </span>
                    <span className="text-[#9DA7B8] font-bold">
                      ⚡ {h.predicted_stop_scroll}% STOP-SCROLL
                    </span>
                  </div>

                  <p className="font-sans text-xs text-white leading-relaxed select-all">
                    "{h.hook_text}"
                  </p>

                  <p className="font-sans text-[10px] text-[#7E8798] mt-1.5">
                    <span className="font-mono-tech text-[#5B6474] uppercase">TACTIC:</span> {h.angle_summary}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleCopy(h.hook_text, h.id)}
                    className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 text-[#9DA7B8] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === h.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#D4FF00]" /> COPIED
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> COPY
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyHook(h.hook_text)}
                    className="px-2.5 py-1 text-[10px] bg-[#D4FF00] text-black font-bold hover:bg-[#bce300] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" /> INSERT INTO STUDIO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
