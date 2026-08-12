import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'viral' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  viral: 'bg-[#D4FF00] hover:bg-[#E2FF44] text-[#07080A] font-bold border border-[#D4FF00] font-display tracking-tight',
  primary: 'bg-[#D4FF00] hover:bg-[#E2FF44] text-[#07080A] font-bold border border-[#D4FF00] font-display tracking-tight',
  secondary: 'bg-[#14171C] hover:bg-[#1C2028] text-[#F4F6F8] border border-white/10 font-mono-tech tracking-wide',
  outline: 'bg-transparent hover:bg-white/[0.04] text-[#E2E6EC] border border-white/20 hover:border-white/40 font-mono-tech tracking-wide',
  ghost: 'bg-transparent hover:bg-white/[0.05] text-[#9DA7B8] hover:text-[#F4F6F8] border border-transparent font-mono-tech',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono-tech',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 rounded-sm gap-1.5',
  md: 'text-xs sm:text-sm px-3.5 py-2 rounded-sm gap-2',
  lg: 'text-sm sm:text-base px-5 py-2.5 rounded-sm gap-2.5',
  xl: 'text-sm sm:text-base px-6 py-3.5 rounded-sm gap-3 uppercase font-bold tracking-wider',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium cursor-pointer transition-all duration-150 select-none outline-none disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
