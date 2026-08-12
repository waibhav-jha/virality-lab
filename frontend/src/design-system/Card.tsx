import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  cornerTicks?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  cornerTicks = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-[#0E1013] border border-white/10 p-5 sm:p-6 relative overflow-hidden transition-all duration-150',
        cornerTicks && 'corner-ticks',
        hoverEffect && 'hover:border-white/25 hover:bg-[#14171C]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
