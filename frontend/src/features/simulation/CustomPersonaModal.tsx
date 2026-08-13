import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
  UserPlus,
  X,
  Sparkles,
  Bot,
  Brain,
  ShieldAlert,
  Clock,
  MessageSquare,
  Check,
} from 'lucide-react';
import { CustomPersonaDefinition } from '../../api/types';
import { Button } from '../../design-system/Button';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePersona: (persona: CustomPersonaDefinition) => void;
}

const PRESETS: Omit<CustomPersonaDefinition, 'id'>[] = [
  {
    name: 'Tech Recruiter',
    archetype: 'CAREER GATEKEEPER',
    desc: 'Scans for hard skills, portfolio proof, and zero tolerance for generic corporate buzzwords.',
    attention_span_seconds: 1.5,
    skepticism_level: 85,
    comment_style: 'Evaluates practical employment value, credentials, and real-world applicability.',
    is_custom: true,
  },
  {
    name: 'Gen-Alpha Gamer',
    archetype: 'HYPER-DOPAMINE FEED',
    desc: 'Sub-second attention filter. Needs instant visual audio payoff and meme vocabulary.',
    attention_span_seconds: 0.8,
    skepticism_level: 40,
    comment_style: 'Speaks in viral internet slang, reacts to pace and sensory stimulation.',
    is_custom: true,
  },
  {
    name: 'Wall Street Quant',
    archetype: 'FINANCIAL SKEPTIC',
    desc: 'Demands hard empirical numbers, ROI statistics, and rigorous risk calculations.',
    attention_span_seconds: 2.5,
    skepticism_level: 95,
    comment_style: 'Fact-checks statistical claims and looks for verifiable alpha/data.',
    is_custom: true,
  },
  {
    name: 'Academic Professor',
    archetype: 'METHODOLOGY CRITIC',
    desc: 'Requires logical proof chains, verified citations, and pedagogical clarity.',
    attention_span_seconds: 3.5,
    skepticism_level: 90,
    comment_style: 'Demands primary source citations and deep structural rigour.',
    is_custom: true,
  },
];

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  onSavePersona,
}) => {
  const [name, setName] = useState<string>('Tech Recruiter');
  const [archetype, setArchetype] = useState<string>('CAREER GATEKEEPER');
  const [desc, setDesc] = useState<string>(
    'Scans for hard skills, portfolio proof, and zero tolerance for generic corporate buzzwords.'
  );
  const [attentionSpan, setAttentionSpan] = useState<number>(1.5);
  const [skepticism, setSkepticism] = useState<number>(85);
  const [commentStyle, setCommentStyle] = useState<string>(
    'Evaluates practical employment value, credentials, and real-world applicability.'
  );

  if (!isOpen) return null;

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setArchetype(preset.archetype);
    setDesc(preset.desc);
    setAttentionSpan(preset.attention_span_seconds);
    setSkepticism(preset.skepticism_level);
    setCommentStyle(preset.comment_style);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newPersona: CustomPersonaDefinition = {
      id: `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      name: name.trim(),
      archetype: archetype.trim() || 'CUSTOM AGENT',
      desc: desc.trim() || 'Custom simulated audience persona',
      attention_span_seconds: attentionSpan,
      skepticism_level: skepticism,
      comment_style: commentStyle.trim() || 'Custom audience feedback',
      is_custom: true,
    };

    onSavePersona(newPersona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0E1013] border border-[#D4FF00]/40 p-6 sm:p-8 flex flex-col gap-6 text-left shadow-[0_0_50px_rgba(212,255,0,0.1)] corner-ticks font-mono-tech">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#D4FF00]/20 border border-[#D4FF00]/60 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#D4FF00]" />
            </div>
            <div>
              <span className="text-[10px] text-[#7E8798] uppercase tracking-wider block">
                03B // AGENT LAB SYNTHESIS
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                SYNTHESIZE NEW BEHAVIORAL AGENT
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#7E8798] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-[#7E8798] uppercase">QUICK PRESET ARCHETYPES:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-2 bg-white/[0.02] border border-white/10 hover:border-[#D4FF00]/50 hover:bg-[#D4FF00]/10 text-left transition-all cursor-pointer flex flex-col justify-between gap-1"
              >
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
                <span className="text-[9px] text-[#D4FF00] uppercase truncate">{p.archetype}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="flex flex-col gap-4">
          {/* Agent Name & Archetype */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#7E8798] uppercase block mb-1">
                AGENT NAME / IDENTITY:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Venture Capitalist"
                className="w-full bg-black/60 border border-white/15 p-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#7E8798] uppercase block mb-1">
                ARCHETYPE BADGE:
              </label>
              <input
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder="e.g. MOAT INVESTOR"
                className="w-full bg-black/60 border border-white/15 p-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-[#7E8798] uppercase block mb-1">
              BEHAVIORAL BIO & CRITIQUE FOCUS:
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What does this agent look for in the first 3 seconds?"
              className="w-full bg-black/60 border border-white/15 p-2 text-xs text-white font-sans focus:border-[#D4FF00] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Sliders: Attention Span & Skepticism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-3 border border-white/10">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7E8798] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4FF00]" /> ATTENTION SPAN
                </span>
                <span className="text-white font-bold">{attentionSpan}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={attentionSpan}
                onChange={(e) => setAttentionSpan(parseFloat(e.target.value))}
                className="w-full accent-[#D4FF00] cursor-pointer"
              />
              <span className="text-[9px] text-[#5B6474] block mt-0.5">
                {attentionSpan <= 1.0 ? 'Sub-second scroll past' : 'Willing to watch long build'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7E8798] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#D4FF00]" /> SKEPTICISM BIAS
                </span>
                <span className="text-white font-bold">{skepticism}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={skepticism}
                onChange={(e) => setSkepticism(parseInt(e.target.value, 10))}
                className="w-full accent-[#D4FF00] cursor-pointer"
              />
              <span className="text-[9px] text-[#5B6474] block mt-0.5">
                {skepticism >= 80 ? 'Fact-checks all claims' : 'Easily captivated by hooks'}
              </span>
            </div>
          </div>

          {/* Comment Style / Persona Voice */}
          <div>
            <label className="text-[10px] text-[#7E8798] uppercase block mb-1">
              VOICE & COMMENT DELIBERATION STYLE:
            </label>
            <input
              type="text"
              value={commentStyle}
              onChange={(e) => setCommentStyle(e.target.value)}
              placeholder="e.g. Evaluates ROI and unit economics"
              className="w-full bg-black/60 border border-white/15 p-2.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <Button variant="outline" size="sm" onClick={onClose}>
            CANCEL
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            SYNTHESIZE & ACTIVATE AGENT
          </Button>
        </div>
      </div>
    </div>
  );
};
