import React from 'react';
import { RotateCcw, Database, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../design-system/Button';
import { HealthResponse } from '../api/types';

interface HeaderProps {
  health?: HealthResponse | null;
  historyCount: number;
  showBack?: boolean;
  onBackToStudio?: () => void;
  onNavigateToLanding?: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  historyCount,
  showBack,
  onBackToStudio,
  onNavigateToLanding,
  onOpenHistory,
  onReset,
}) => {
  const isOnline = !!health;
  const isLlmMode = health?.simulation_mode === 'llm' || health?.simulation_mode === 'real';

  return (
    <header className="w-full border-b-2 border-white/20 bg-[#060709]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      {/* Brand & Editorial Masthead */}
      <div className="flex items-center gap-4 text-left">
        <div 
          onClick={onNavigateToLanding}
          className="flex items-baseline gap-2.5 cursor-pointer group"
          title="Return to Landing Portal"
        >
          <span className="font-astroda font-black text-xl sm:text-2xl tracking-widest text-white group-hover:text-[#D4FF00] uppercase glitch-hover transition-colors">
            VIRALITY LAB
          </span>
          <span className="font-mechanismo text-[10px] text-[#D4FF00] tracking-widest uppercase bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">
            // SPECIMEN ENGINE v0.9
          </span>
        </div>
        <span className="hidden md:inline-block w-px h-5 bg-white/25" />
        <span className="hidden md:inline-block text-[11px] font-mechanismo text-[#8E98AA] uppercase tracking-wider">
          AUTONOMOUS AUDIENCE INTELLIGENCE
        </span>
      </div>

      {/* Center / Right Technical Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Return to Landing Page Button */}
        {onNavigateToLanding && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Home className="w-3.5 h-3.5 text-[#D4FF00]" />}
            onClick={onNavigateToLanding}
            className="font-csmigrate text-xs uppercase"
          >
            LANDING PORTAL
          </Button>
        )}

        {/* Back to Studio Button (When viewing results) */}
        {showBack && onBackToStudio && (
          <Button
            variant="viral"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={onBackToStudio}
            className="font-csmigrate font-black uppercase tracking-wider text-[11px] animate-cyber-pulse"
          >
            ← EDIT SPECIMEN
          </Button>
        )}

        {/* Engine Telemetry Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#0B0D11] border-2 border-white/15 font-mechanismo text-[11px] shadow-[2px_2px_0px_0px_#000]">
          <span
            className={`w-2 h-2 rounded-none border border-black ${
              isOnline ? 'bg-[#D4FF00] animate-pulse shadow-[0_0_8px_#D4FF00]' : 'bg-amber-400'
            }`}
          />
          <span className="text-[#A2ABB9] uppercase font-bold tracking-wider">
            {isOnline ? (isLlmMode ? `SYS: ${health?.llm_provider || 'LLM'}` : 'SYS: MOCK_CALIBRATED') : 'SYS: LOCAL_MOCK'}
          </span>
        </div>

        {/* New Experiment Action */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3 h-3" />}
          onClick={onReset}
          className="hidden sm:inline-flex font-csmigrate text-xs"
        >
          RESET
        </Button>

        {/* History Audit Ledger Trigger */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Database className="w-3.5 h-3.5 text-[#D4FF00]" />}
          onClick={onOpenHistory}
        >
          <span className="font-csmigrate">AUDIT LOG</span>
          {historyCount > 0 && (
            <span className="ml-1.5 font-mechanismo text-[10px] text-[#D4FF00] font-black bg-[#D4FF00]/15 px-1 border border-[#D4FF00]/40">
              [{historyCount}]
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};
