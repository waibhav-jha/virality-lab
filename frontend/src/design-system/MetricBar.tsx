import React from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricBarProps {
  label: string;
  value: number; // 0 to 100
  previousValue?: number; // For before/after diffs
  description?: string;
  icon?: React.ReactNode;
  color?: 'emerald' | 'cyan' | 'amber' | 'violet' | 'rose' | 'accent';
  showDiff?: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  label,
  value,
  previousValue,
  description,
  icon,
  color = 'accent',
  showDiff = false,
}) => {
  const currentVal = Math.min(100, Math.max(0, Math.round(value)));
  const prevVal = previousValue !== undefined ? Math.min(100, Math.max(0, Math.round(previousValue))) : null;
  const diff = prevVal !== null ? currentVal - prevVal : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full py-1">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1.5 tech-label">
          {icon && <span className="text-white/40">{icon}</span>}
          <span className="text-[#E2E6EC] font-semibold text-xs tracking-wider">{label}</span>
        </div>

        <div className="flex items-baseline gap-2 font-mono-tech">
          {showDiff && prevVal !== null && diff !== 0 && (
            <span
              className={clsx(
                'inline-flex items-center text-[11px] font-bold px-1 py-0.2',
                diff > 0
                  ? 'text-[#D4FF00] bg-[#D4FF00]/10 border border-[#D4FF00]/30'
                  : 'text-red-400 bg-red-500/10 border border-red-500/30'
              )}
            >
              {diff > 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {diff > 0 ? `+${diff}` : `${diff}`}
            </span>
          )}
          <span className="font-mono-tech text-sm sm:text-base font-bold text-white">
            {currentVal}
            <span className="text-[10px] text-white/40 font-normal ml-0.5">/100</span>
          </span>
        </div>
      </div>

      {/* Hairline Precision Track with Scale Ticks */}
      <div className="relative h-1.5 w-full bg-white/[0.06] overflow-hidden">
        {/* Previous Value Marker */}
        {showDiff && prevVal !== null && (
          <div
            className="absolute top-0 bottom-0 bg-white/20 z-0 transition-all duration-300"
            style={{ width: `${prevVal}%` }}
          />
        )}
        {/* Active Value Bar */}
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out relative z-10',
            color === 'accent' || color === 'emerald'
              ? 'bg-[#D4FF00]'
              : color === 'amber'
              ? 'bg-amber-400'
              : color === 'rose'
              ? 'bg-red-400'
              : 'bg-white'
          )}
          style={{ width: `${currentVal}%` }}
        />
      </div>

      {description && (
        <span className="text-[11px] text-[#7E8798] leading-tight font-mono-tech">{description}</span>
      )}
    </div>
  );
};
