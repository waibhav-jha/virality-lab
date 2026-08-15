import React from 'react';
import { RotateCcw, Database, ArrowLeft, Home, Terminal } from 'lucide-react';
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
    <header className="w-full border-b-2 border-[#00FF41] bg-[#000000]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_4px_25px_rgba(0,255,65,0.15)]">
      {/* Brand & Editorial Masthead */}
      <div className="flex items-center gap-4 text-left">
        <div 
          onClick={onNavigateToLanding}
          className="flex items-baseline gap-2.5 cursor-pointer group"
          title="Return to Landing Portal"
        >
          <span className="font-astroda font-black text-xl sm:text-2xl tracking-widest text-white group-hover:text-[#00FF41] uppercase glitch-hover transition-colors">
            VIRALITY LAB
          </span>
          <span className="font-mechanismo text-[10px] text-[#00FF41] tracking-widest uppercase bg-[#00FF41]/10 px-2 py-0.5 border border-[#00FF41]/40">
            AI STUDIO v1.0
          </span>
        </div>
        <span className="hidden md:inline-block w-px h-5 bg-[#00FF41]/30" />
        <span className="hidden md:inline-block text-[11px] font-mono text-[#8E9E90] uppercase tracking-wider">
          MULTI-AGENT AUDIENCE ENGINE
        </span>
      </div>

      {/* Center / Right Technical Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Return to Landing Page Button */}
        {onNavigateToLanding && (
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="btn-terminal font-mono text-xs uppercase cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>[LANDING PORTAL]</span>
          </button>
        )}

        {/* Back to Studio Button (When viewing results) */}
        {showBack && onBackToStudio && (
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3 py-1.5 bg-[#00FF41] text-black font-black uppercase tracking-wider text-xs font-csmigrate shadow-[2px_2px_0px_0px_#000] hover:bg-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← EDIT SPECIMEN</span>
          </button>
        )}

        {/* System Diodes & Telemetry Status */}
        <div className="corner-brackets hidden sm:flex">
          <div className="sys-diodes">
            <span className="diode"></span>
            <span className="diode pulse"></span>
          </div>
          <span className="sys-text">
            {isOnline ? (isLlmMode ? `SYS_01 :: ${health?.llm_provider || 'LLM'}` : 'SYS_01 :: ONLINE') : 'SYS_01 :: LOCAL_CALIBRATED'}
          </span>
        </div>

        {/* New Experiment Action */}
        <button
          type="button"
          onClick={onReset}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#050705] border border-white/20 text-[#A2B0A5] hover:text-white hover:border-[#00FF41] font-mono text-xs cursor-pointer shadow-[2px_2px_0px_0px_#000]"
        >
          <RotateCcw className="w-3 h-3 text-[#00FF41]" />
          <span>RESET</span>
        </button>

        {/* History Audit Ledger Trigger */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050705] border border-[#00FF41]/40 text-white hover:border-[#00FF41] hover:bg-[#00FF41]/10 font-mono text-xs cursor-pointer shadow-[2px_2px_0px_0px_#000]"
        >
          <Database className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>AUDIT LOG</span>
          {historyCount > 0 && (
            <span className="ml-1 font-mechanismo text-[10px] text-[#00FF41] font-black bg-[#00FF41]/15 px-1 border border-[#00FF41]/40">
              [{historyCount}]
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
