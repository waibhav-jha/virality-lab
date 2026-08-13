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
    <div className="w-full flex flex-col gap-3 font-mechanismo">
      {/* Trigger Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={disabled || isGenerating}
          onClick={generateHooks}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4FF00] border-2 border-black text-[#060709] hover:bg-[#E2FF44] transition-all text-xs font-black uppercase font-csmigrate cursor-pointer shadow-[2px_2px_0px_0px_#000]"
        >
          <Sparkles className={clsx('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
          <span>⚡ DRAFT 3 VIRAL HOOKS (AI ASSISTANT)</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[10px] text-[#8E98AA] hover:text-white uppercase font-bold"
          >
            [HIDE ASSISTANT]
          </button>
        )}
      </div>

      {/* Generated Hooks Drawer / Container */}
      {isOpen && (
        <div className="bg-[#07080A] border-2 border-[#D4FF00] p-4 flex flex-col gap-3.5 shadow-[3px_3px_0px_0px_#D4FF00]">
          <div className="flex items-center justify-between border-b border-white/15 pb-2 text-[10px] text-[#8E98AA] uppercase">
            <span className="text-white font-black flex items-center gap-1.5 font-csmigrate text-xs">
              <Zap className="w-3.5 h-3.5 text-[#D4FF00]" />
              AI HOOK SYNTHESIZER · TARGETING {platform.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={generateHooks}
              className="text-[#D4FF00] hover:underline cursor-pointer flex items-center gap-1 font-black text-xs"
            >
              <RefreshCw className={clsx('w-3 h-3', isGenerating && 'animate-spin')} />
              RE-GENERATE
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {hooks.map((h) => (
              <div
                key={h.id}
                className="bg-[#0C0F16] border-2 border-white/15 p-3.5 flex flex-col justify-between gap-2.5 hover:border-[#D4FF00]/60 transition-all shadow-[2px_2px_0px_0px_#000]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <span className="font-black text-[#D4FF00] uppercase bg-[#D4FF00]/10 px-2 py-0.5 border border-[#D4FF00]/30 font-csmigrate">
                      {h.archetype_label}
                    </span>
                    <span className="text-[#00FF41] font-black">
                      ⚡ {h.predicted_stop_scroll}% STOP-SCROLL
                    </span>
                  </div>

                  <p className="font-sans text-xs text-white leading-relaxed select-all">
                    "{h.hook_text}"
                  </p>

                  <p className="font-sans text-[11px] text-[#8E98AA] mt-1.5">
                    <span className="font-mechanismo text-[#646E82] uppercase font-bold">TACTIC:</span> {h.angle_summary}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleCopy(h.hook_text, h.id)}
                    className="px-2.5 py-1 text-xs bg-[#11141C] border border-white/20 text-[#A2ABB9] hover:text-white flex items-center gap-1 cursor-pointer font-csmigrate font-bold"
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
                    className="px-3 py-1 text-xs bg-[#D4FF00] text-[#060709] font-black hover:bg-[#E2FF44] flex items-center gap-1 cursor-pointer font-csmigrate shadow-[1px_1px_0px_0px_#000]"
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
