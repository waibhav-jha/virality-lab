import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'emerald' | 'cyan' | 'amber' | 'violet' | 'rose' | 'slate' | 'outline' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  accent: 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  cyan: 'bg-white/10 text-white border-white/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  violet: 'bg-white/5 text-[#E2E6EC] border-white/15',
  rose: 'bg-red-500/10 text-red-300 border-red-500/25',
  slate: 'bg-white/[0.04] text-[#9DA7B8] border-white/10',
  outline: 'bg-transparent text-[#9DA7B8] border-white/15',
};

const sizeStyles = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-none gap-1 tracking-wider uppercase font-mono-tech',
  md: 'text-xs px-2.5 py-0.5 rounded-none gap-1.5 tracking-wider uppercase font-mono-tech',
  lg: 'text-xs px-3 py-1 rounded-none gap-2 tracking-widest uppercase font-mono-tech font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center border select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
