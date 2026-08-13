import { RotateCcw, Database, ArrowLeft } from 'lucide-react';
import { Button } from '../design-system/Button';
import { HealthResponse } from '../api/types';

interface HeaderProps {
  health?: HealthResponse | null;
  historyCount: number;
  showBack?: boolean;
  onBackToStudio?: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  historyCount,
  showBack,
  onBackToStudio,
  onOpenHistory,
  onReset,
}) => {
  const isOnline = !!health;
  const isLlmMode = health?.simulation_mode === 'llm' || health?.simulation_mode === 'real';

  return (
    <header className="w-full border-b border-white/10 bg-[#07080A]/95 backdrop-blur-sm sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand & Editorial Masthead */}
      <div className="flex items-center gap-4 text-left">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white uppercase">
            VIRALITY LAB
          </span>
          <span className="font-mono-tech text-[10px] text-[#D4FF00] tracking-widest uppercase">
            // SPECIMEN ENGINE v0.8
          </span>
        </div>
        <span className="hidden md:inline-block w-px h-4 bg-white/20" />
        <span className="hidden md:inline-block text-[11px] font-mono-tech text-[#7E8798] uppercase tracking-wide">
          AUDIENCE INTELLIGENCE INSTRUMENT
        </span>
      </div>

      {/* Center / Right Technical Controls */}
      <div className="flex items-center gap-3">
        {/* Back to Studio Button */}
        {showBack && onBackToStudio && (
          <Button
            variant="viral"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={onBackToStudio}
            className="font-bold uppercase tracking-wider text-[11px]"
          >
            ← BACK TO STUDIO
          </Button>
        )}

        {/* Engine Telemetry Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 font-mono-tech text-[11px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-[#D4FF00]' : 'bg-amber-400'
            }`}
          />
          <span className="text-[#9DA7B8] uppercase">
            {isOnline ? (isLlmMode ? `ENGINE: ${health?.llm_provider || 'LLM'}` : 'ENGINE: MOCK_SYS') : 'ENGINE: LOCAL'}
          </span>
        </div>

        {/* New Experiment Action */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3 h-3" />}
          onClick={onReset}
          className="hidden sm:inline-flex"
        >
          RESET SPECIMEN
        </Button>


        {/* History Audit Ledger Trigger */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Database className="w-3 h-3 text-[#D4FF00]" />}
          onClick={onOpenHistory}
        >
          <span>AUDIT LOG</span>
          {historyCount > 0 && (
            <span className="ml-1 font-mono-tech text-[10px] text-[#D4FF00] font-bold">
              [{historyCount}]
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};
