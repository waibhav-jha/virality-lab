import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Shuffle,
} from 'lucide-react';
import { Platform, ViralHookCandidate } from '../../api/types';

interface ViralHookGeneratorProps {
  caption: string;
  platform: Platform;
  onApplyHook: (hookText: string) => void;
  disabled?: boolean;
}

interface HookArchetypeTemplate {
  archetype: 'contrarian' | 'curiosity_framework' | 'story_transformation';
  archetype_label: string;
  templates: ((topic: string, tag: string) => string)[];
  angle_summaries: string[];
  baseScore: number;
}

const HOOK_ARCHETYPE_LIBRARY: HookArchetypeTemplate[] = [
  {
    archetype: 'contrarian',
    archetype_label: '01 // POLARIZING CONTRARIAN',
    templates: [
      (t, tag) => `Stop scrolling: 95% of people are doing ${t} completely backwards. Here is what the top 1% do instead: ${tag}`,
      (t, tag) => `Unpopular opinion: Almost everything you were told about ${t} is a trap. Here is the real playbook: ${tag}`,
      (t, tag) => `Stop wasting hours on ${t}. Most advice in this niche is 3 years outdated — here is what actually moves the needle: ${tag}`,
      (t, tag) => `Hard truth: If you're struggling with ${t}, it's not a lack of effort — you're using the wrong framework. Let me explain: ${tag}`,
    ],
    angle_summaries: [
      'Challenges status quo orthodoxy, sparking counter-intuitive curiosity and rapid comment debate.',
      'Exposes industry misconceptions to trigger immediate cognitive dissonance.',
      'Shatters outdated advice, establishing instant authoritative credibility.',
    ],
    baseScore: 94,
  },
  {
    archetype: 'curiosity_framework',
    archetype_label: '02 // NUMBERED CURIOSITY FRAMEWORK',
    templates: [
      (t, tag) => `3 underrated systems for ${t} that saved me 15 hours this week (and #2 feels almost unfair). Bookmark this! ${tag}`,
      (t, tag) => `The 4-step cheat sheet for ${t} that 99% of beginners skip. (Save this before you start): ${tag}`,
      (t, tag) => `5 actionable rules for mastering ${t} without burning out. Step 3 is the catalyst: ${tag}`,
      (t, tag) => `The exact 3-part blueprint we used to scale ${t} in under 30 days. Breakdown below: ${tag}`,
    ],
    angle_summaries: [
      'Anchors specific numerical payoffs and delivers extreme reference/save utility.',
      'Structured step-by-step clarity reduces cognitive load and maximizes bookmark rates.',
      'Curiosity loop anchored on a specific bullet point drives full watch-through.',
    ],
    baseScore: 92,
  },
  {
    archetype: 'story_transformation',
    archetype_label: '03 // HIGH-STAKES TRANSFORMATION',
    templates: [
      (t, tag) => `I spent 6 months failing at ${t} until I discovered this 1 subtle shift. Here’s the transparent breakdown: ${tag}`,
      (t, tag) => `From 0 to mastery in ${t}: The 3 costly mistakes I made so you don’t have to. Read this carefully: ${tag}`,
      (t, tag) => `How one simple change in our approach to ${t} 10x'd our output in 14 days. Full story: ${tag}`,
      (t, tag) => `If I had to start over with ${t} from zero today, here is the exact 7-day protocol I would follow: ${tag}`,
    ],
    angle_summaries: [
      'Leverages vulnerability and personal experience to build deep empathetic rapport.',
      'High-stakes transformation arc guarantees audience emotional investment.',
      'Zero-to-one roadmap framing creates irresistible retention pull.',
    ],
    baseScore: 89,
  },
  {
    archetype: 'contrarian',
    archetype_label: '04 // MISTAKE EXPOSER (ANTI-ADVICE)',
    templates: [
      (t, tag) => `If you are still making this #1 mistake with ${t}, you are leaving 80% of your results on the table: ${tag}`,
      (t, tag) => `Warning: Never do ${t} without checking these 3 critical variables first. (Most people learn the hard way): ${tag}`,
      (t, tag) => `The 3 toxic habits that are quietly sabotaging your ${t} progress — and how to fix them today: ${tag}`,
    ],
    angle_summaries: [
      'Loss aversion trigger creates an immediate urgency to halt scrolling and avoid penalties.',
      'Protective warning framing triggers defensive psychological curiosity.',
    ],
    baseScore: 93,
  },
  {
    archetype: 'curiosity_framework',
    archetype_label: '05 // SPEED & EFFICIENCY HACK',
    templates: [
      (t, tag) => `How to cut 10+ hours off your ${t} workflow using this simple 2-minute system: ${tag}`,
      (t, tag) => `The fastest way to achieve breakthrough results in ${t} (no complex tools required): ${tag}`,
      (t, tag) => `Stop overcomplicating ${t}. Here is the 15-minute daily routine that gets 90% of the outcome: ${tag}`,
    ],
    angle_summaries: [
      'Appeals to modern short attention spans by promising maximum outcome in minimum time.',
      'De-complexifies intimidating workflows for instant audience gratitude and shares.',
    ],
    baseScore: 91,
  },
  {
    archetype: 'story_transformation',
    archetype_label: '06 // UNFAIR ADVANTAGE / SECRET WEAPON',
    templates: [
      (t, tag) => `This feels like a cheat code: The little-known tool stack that makes ${t} effortless: ${tag}`,
      (t, tag) => `The secret weapon top performers use for ${t} that nobody is talking about publicly: ${tag}`,
      (t, tag) => `I tested 20+ different methods for ${t}. Only these 2 actually worked: ${tag}`,
    ],
    angle_summaries: [
      'Exclusivity and insider knowledge trigger high DM forwarding and bookmark ratios.',
      'Curated filter mechanism saves audience trial-and-error friction.',
    ],
    baseScore: 95,
  },
];

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
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Extract clean context keywords from caption
  const extractTopic = (): string => {
    if (!caption || !caption.trim()) {
      return 'AI workflow productivity and content systems';
    }
    const clean = caption
      .replace(/#\w+/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^\w\s]/gi, ' ')
      .trim();

    const words = clean.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 3) {
      return words.slice(0, 6).join(' ');
    }
    return clean.length > 3 ? clean : 'content creation workflows';
  };

  const getPlatformTag = (): string => {
    switch (platform) {
      case 'tiktok':
        return '#tiktoktips #viral #learnontiktok #fyp';
      case 'instagram':
        return '#reelsgrowth #explorepage #productivity #creators';
      case 'youtube':
        return '#shorts #trending #techtips #productivity';
      case 'x':
        return '#buildinpublic #productivity #tech';
      case 'linkedin':
        return '#leadership #innovation #productivity #strategy';
      default:
        return `#${platform} #viral #tips`;
    }
  };

  const generateHooks = () => {
    setIsGenerating(true);
    setIsOpen(true);

    setTimeout(() => {
      const topic = extractTopic();
      const platformTag = getPlatformTag();

      // Shuffle the archetype library and pick 3 distinct categories
      const shuffled = [...HOOK_ARCHETYPE_LIBRARY].sort(() => Math.random() - 0.5);
      const selectedArchetypes = shuffled.slice(0, 3);

      const generated: ViralHookCandidate[] = selectedArchetypes.map((arch, index) => {
        // Pick a random template and summary from this archetype
        const templateFn = arch.templates[Math.floor(Math.random() * arch.templates.length)];
        const summary = arch.angle_summaries[Math.floor(Math.random() * arch.angle_summaries.length)];
        const hookText = templateFn(topic, platformTag);

        // Calculate dynamic randomized score with jitter
        const jitter = Math.floor(Math.random() * 7) - 2;
        const predictedScore = Math.min(98, Math.max(82, arch.baseScore + jitter));

        return {
          id: `hook_${generationCount}_${index}_${Date.now()}`,
          archetype: arch.archetype,
          archetype_label: arch.archetype_label,
          hook_text: hookText,
          predicted_stop_scroll: predictedScore,
          angle_summary: summary,
        };
      });

      setHooks(generated);
      setGenerationCount((c) => c + 1);
      setIsGenerating(false);
    }, 280);
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
            className="text-[10px] text-[#8E98AA] hover:text-white uppercase font-bold cursor-pointer"
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
              className="text-[#D4FF00] hover:underline cursor-pointer flex items-center gap-1 font-black text-xs font-csmigrate"
            >
              <RefreshCw className={clsx('w-3 h-3', isGenerating && 'animate-spin')} />
              <span>RE-GENERATE (CYCLE ANGLES)</span>
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
