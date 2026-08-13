import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Platform, OptimizationObjective, CustomPersonaDefinition } from '../../api/types';
import { MediaDropzone } from './MediaDropzone';
import { PlatformAlgorithmTelemetry } from '../platform/PlatformAlgorithmTelemetry';
import { ViralHookGenerator } from './ViralHookGenerator';
import { CustomPersonaModal } from '../simulation/CustomPersonaModal';
import { UserPlus, Trash2, Bot } from 'lucide-react';

interface ExperimentControlsProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  caption: string;
  setCaption: (c: string) => void;
  transcript: string;
  setTranscript: (t: string) => void;
  selectedPersonas: string[];
  setSelectedPersonas: (personas: string[]) => void;
  objective: OptimizationObjective;
  setObjective: (obj: OptimizationObjective) => void;
  optimizationEnabled: boolean;
  setOptimizationEnabled: (enabled: boolean) => void;
  mediaPath?: string;
  mediaUrl?: string;
  mediaType: string;
  onMediaSelected: (file: File, path: string, previewUrl: string, mediaType: 'short_video' | 'image') => void;
  onMediaCleared: () => void;
  disabled?: boolean;
}

const DEFAULT_PERSONAS = [
  { id: 'gen_z_student', name: 'Gen-Z Student', desc: 'Fast hook filter, meme-literate, high drop-off rate', archetype: '01 / SPEED FILTER' },
  { id: 'casual_scroller', name: 'Casual Scroller', desc: 'Entertainment seeker, values rapid payoff & clarity', archetype: '02 / VOLUME TRAFFIC' },
  { id: 'content_creator', name: 'Content Creator', desc: 'Analyzes pacing, framing, sound cue & retention tricks', archetype: '03 / PEER BENCHMARK' },
  { id: 'skeptic_analyst', name: 'Skeptic Analyst', desc: 'Challenges clickbait, fact-checks credibility & claims', archetype: '04 / CRITICAL FILTER' },
  { id: 'niche_expert', name: 'Niche Expert', desc: 'Demands actionable depth, high technical substance', archetype: '05 / RETENTION CORE' },
];

const OBJECTIVES: { id: OptimizationObjective; label: string; desc: string }[] = [
  { id: 'overall', label: '01 // BALANCED VIRALITY', desc: 'Holistic reach & composite virality score' },
  { id: 'retention', label: '02 // MAX RETENTION', desc: 'Hook stabilization & drop-off suppression' },
  { id: 'shares', label: '03 // PEER FORWARDING', desc: 'High peer-share & viral propagation resonance' },
  { id: 'comments', label: '04 // CONVERSATION', desc: 'Polarizing or curiosity-inducing debate' },
  { id: 'saves', label: '05 // HIGH UTILITY', desc: 'Bookmarkable reference density' },
  { id: 'conversion', label: '06 // CONVERSION', desc: 'Direct profile follow & viewer capture' },
];

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({
  platform,
  setPlatform,
  caption,
  setCaption,
  transcript,
  setTranscript,
  selectedPersonas,
  setSelectedPersonas,
  objective,
  setObjective,
  optimizationEnabled,
  setOptimizationEnabled,
  mediaPath,
  mediaUrl,
  mediaType,
  onMediaSelected,
  onMediaCleared,
  disabled = false,
}) => {
  const [customPersonas, setCustomPersonas] = useState<CustomPersonaDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('virality_lab_custom_personas');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);

  const allPersonas = [...DEFAULT_PERSONAS, ...customPersonas];

  const handleAddCustomPersona = (newPersona: CustomPersonaDefinition) => {
    const updated = [...customPersonas, newPersona];
    setCustomPersonas(updated);
    try {
      localStorage.setItem('virality_lab_custom_personas', JSON.stringify(updated));
    } catch (_) {}
    if (!selectedPersonas.includes(newPersona.name)) {
      setSelectedPersonas([...selectedPersonas, newPersona.name]);
    }
  };

  const handleDeleteCustomPersona = (pId: string, pName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPersonas.filter((p) => p.id !== pId);
    setCustomPersonas(updated);
    try {
      localStorage.setItem('virality_lab_custom_personas', JSON.stringify(updated));
    } catch (_) {}
    setSelectedPersonas(selectedPersonas.filter((n) => n !== pName));
  };

  const togglePersona = (pId: string) => {
    if (selectedPersonas.includes(pId)) {
      if (selectedPersonas.length === 1) return; // Keep at least one
      setSelectedPersonas(selectedPersonas.filter((id) => id !== pId));
    } else {
      setSelectedPersonas([...selectedPersonas, pId]);
    }
  };

  const selectAllPersonas = () => {
    setSelectedPersonas(allPersonas.map((p) => p.name));
  };

  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;
  const charCount = caption.length;

  return (
    <div className="flex flex-col gap-6 w-full text-left" aria-label="Experiment Parameter Controls">
      {/* 1. Target Platform Matrix */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between font-mechanismo text-[11px] text-[#8E98AA] uppercase font-bold">
          <span className="text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">[01 // TARGET ALGORITHM ENGINE]</span>
          <span>CALIBRATED WEIGHTS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mechanismo text-xs">
          {(
            [
              { id: 'tiktok', label: 'TIKTOK', code: 'TT-ALG' },
              { id: 'instagram', label: 'REELS', code: 'IG-REEL' },
              { id: 'youtube', label: 'SHORTS', code: 'YT-SHRT' },
              { id: 'x', label: 'X / TWITTER', code: 'X-FEED' },
              { id: 'linkedin', label: 'LINKEDIN', code: 'LI-ALGO' },
            ] as const
          ).map((p) => {
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => setPlatform(p.id)}
                className={clsx(
                  'flex flex-col items-start p-3 border-2 transition-all text-left cursor-pointer shadow-[2px_2px_0px_0px_#000]',
                  isSelected
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00] font-black shadow-[3px_3px_0px_0px_#D4FF00]'
                    : 'bg-[#07080A] border-white/15 text-[#8E98AA] hover:text-white hover:border-[#D4FF00]/50'
                )}
              >
                <span className={clsx('text-[10px] font-mechanismo font-bold tracking-wider', isSelected ? 'text-black/70' : 'text-[#646E82]')}>{p.code}</span>
                <span className="text-xs font-csmigrate font-black uppercase tracking-tight">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Platform Algorithm Weights & Telemetry */}
        <PlatformAlgorithmTelemetry platform={platform} />
      </div>

      {/* 2. Media Asset Dropzone */}
      <MediaDropzone
        mediaPath={mediaPath}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        onMediaSelected={onMediaSelected}
        onMediaCleared={onMediaCleared}
      />

      {/* 3. Caption / Script Specimen Editor */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between font-mechanismo text-[11px] text-[#8E98AA] uppercase font-bold">
          <label className="text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 border border-[#00F0FF]/40 flex items-center gap-1.5">
            <span>[02 // HOOK, CAPTION & SCRIPT SPECIMEN]</span>
          </label>
          <div className="flex items-center gap-2 bg-[#07080A] px-2 py-1 border border-white/10 text-xs">
            <span className="text-white font-bold">{wordCount} WORDS</span>
            <span className="text-white/30">|</span>
            <span className="text-[#D4FF00] font-bold">{charCount} CHARS</span>
          </div>
        </div>

        <div className="relative border-2 border-white/20 bg-[#060709] focus-within:border-[#D4FF00] transition-colors shadow-[3px_3px_0px_0px_#000]">
          <textarea
            rows={4}
            value={caption}
            disabled={disabled}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Type or paste specimen hook, script, caption, or thread text..."
            className="w-full bg-transparent p-3.5 text-xs sm:text-sm text-[#F4F6F8] font-sans placeholder-[#4A5364] resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Feature D: In-Studio Viral Hook AI Assistant */}
        <ViralHookGenerator
          caption={caption}
          platform={platform}
          onApplyHook={(hookText) => setCaption(hookText)}
          disabled={disabled}
        />
      </div>

      {/* 4. Audience Agent Panel */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between font-mechanismo text-[11px] text-[#8E98AA] uppercase gap-2 font-bold">
          <label className="text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40 flex items-center gap-1.5">
            <span>[03 // AUDIENCE AGENT ROSTER]</span>
            <span className="text-white">
              ({selectedPersonas.length}/{allPersonas.length} ACTIVE)
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPersonaModalOpen(true)}
              className="text-[#00F0FF] hover:underline cursor-pointer uppercase font-black flex items-center gap-1 font-csmigrate text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + SYNTHESIZE AGENT
            </button>
            <span className="text-white/30">|</span>
            <button
              type="button"
              onClick={selectAllPersonas}
              className="text-white/80 hover:text-[#D4FF00] cursor-pointer uppercase font-black font-csmigrate text-xs"
            >
              SELECT ALL
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 font-mechanismo">
          {allPersonas.map((persona) => {
            const isChecked =
              selectedPersonas.includes(persona.name) || selectedPersonas.includes(persona.id);
            const isCustom = Boolean('is_custom' in persona && persona.is_custom);

            return (
              <div
                key={persona.id}
                onClick={() => !disabled && togglePersona(persona.name)}
                className={clsx(
                  'p-3 border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none text-xs shadow-[2px_2px_0px_0px_#000]',
                  isChecked
                    ? isCustom
                      ? 'bg-[#0D1017] border-[#00F0FF] text-white shadow-[2px_2px_0px_0px_#00F0FF]'
                      : 'bg-[#0E1219] border-[#D4FF00] text-white shadow-[2px_2px_0px_0px_#D4FF00]'
                    : 'bg-[#07080A] border-white/15 text-[#646E82] opacity-60 hover:opacity-100 hover:border-white/30'
                )}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase tracking-wider font-csmigrate text-sm">{persona.name}</span>
                    <span
                      className={clsx(
                        'text-[10px] font-mechanismo font-bold px-1.5 py-0.2 border',
                        isCustom ? 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10' : 'text-[#8E98AA] border-white/10'
                      )}
                    >
                      [{persona.archetype}]
                    </span>
                  </div>
                  <span className="text-xs text-[#8E98AA] font-sans truncate mt-0.5">
                    {persona.desc}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCustom ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomPersona(persona.id, persona.name, e)}
                      className="p-1 text-[#8E98AA] hover:text-[#EF4444] cursor-pointer transition-colors"
                      title="Remove synthesized agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <span
                    className={clsx(
                      'text-xs font-black font-csmigrate px-2 py-0.5 border',
                      isChecked
                        ? isCustom
                          ? 'bg-[#00F0FF] text-[#060709] border-[#00F0FF]'
                          : 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                        : 'bg-transparent text-white/30 border-white/15'
                    )}
                  >
                    {isChecked ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature E: Custom Persona Synthesis Modal */}
      <CustomPersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSavePersona={handleAddCustomPersona}
      />

      {/* 5. Optimization Target Matrix */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between font-mechanismo text-[11px] text-[#8E98AA] uppercase font-bold">
          <label className="text-white/90">
            <span>[04 // OPTIMIZATION & VARIANT SEARCH]</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-bold">
            <span className="text-white/70">SYNTHESIZE VARIANTS</span>
            <input
              type="checkbox"
              checked={optimizationEnabled}
              onChange={(e) => setOptimizationEnabled(e.target.checked)}
              className="w-4 h-4 rounded-none border-2 border-white/30 text-[#D4FF00] bg-black accent-[#D4FF00] cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mechanismo">
          {OBJECTIVES.map((obj) => {
            const isSelected = objective === obj.id;
            return (
              <button
                key={obj.id}
                type="button"
                disabled={disabled || !optimizationEnabled}
                onClick={() => setObjective(obj.id)}
                className={clsx(
                  'flex flex-col text-left p-3 border-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 disabled:cursor-not-allowed',
                  isSelected && optimizationEnabled
                    ? 'bg-[#0D1017] border-[#D4FF00] text-white shadow-[2px_2px_0px_0px_#D4FF00]'
                    : 'bg-[#07080A] border-white/15 text-[#8E98AA] hover:border-white/30 hover:text-white'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black tracking-wider font-csmigrate">{obj.label}</span>
                  {isSelected && optimizationEnabled && (
                    <span className="w-2 h-2 bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
                  )}
                </div>
                <span className="text-xs text-[#8E98AA] mt-0.5 font-sans leading-tight">{obj.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
