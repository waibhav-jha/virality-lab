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
  viral: 'bg-[#D4FF00] hover:bg-[#E2FF44] text-[#060709] font-black border-2 border-[#D4FF00] font-csmigrate tracking-wide shadow-[3px_3px_0px_0px_#000,3px_3px_0px_1.5px_#FFFFFF] hover:shadow-[4px_4px_0px_0px_#000,4px_4px_0px_1.5px_#D4FF00] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000]',
  primary: 'bg-[#D4FF00] hover:bg-[#E2FF44] text-[#060709] font-bold border-2 border-[#D4FF00] font-csmigrate tracking-wide shadow-[3px_3px_0px_0px_#000,3px_3px_0px_1.5px_#D4FF00] hover:shadow-[4px_4px_0px_0px_#000,4px_4px_0px_1.5px_#E2FF44] hover:-translate-x-0.5 hover:-translate-y-0.5',
  secondary: 'bg-[#0E1015] hover:bg-[#161A22] text-[#F4F6F8] border border-white/20 font-mono-tech tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:border-[#D4FF00]/60 hover:text-white hover:shadow-[3px_3px_0px_0px_#D4FF00]',
  outline: 'bg-transparent hover:bg-white/[0.04] text-[#E2E6EC] border border-white/25 hover:border-[#D4FF00] hover:text-[#D4FF00] font-mono-tech tracking-wide hover:shadow-[2px_2px_0px_0px_#D4FF00]',
  ghost: 'bg-transparent hover:bg-white/[0.06] text-[#9DA7B8] hover:text-[#F4F6F8] border border-transparent font-mono-tech',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 font-mono-tech shadow-[2px_2px_0px_0px_#EF4444]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-xs sm:text-sm px-4 py-2 gap-2',
  lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5',
  xl: 'text-sm sm:text-base px-7 py-3.5 gap-3 uppercase font-bold tracking-wider',
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
