import React from 'react';

interface WaveformContourProps {
  variant?: 'topography' | 'signal' | 'mesh' | 'crosshair';
  className?: string;
  opacity?: number;
}

export const WaveformContour: React.FC<WaveformContourProps> = ({
  variant = 'topography',
  className = '',
  opacity = 0.2,
}) => {
  if (variant === 'signal') {
    return (
      <svg
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        {[...Array(9)].map((_, i) => {
          const offset = (i - 4) * 8;
          const spread = 20 + i * 4;
          return (
            <path
              key={i}
              d={`M 0,${100 + offset} C 100,${60 + offset * 1.5} 180,${140 - offset} 260,${70 + offset} C 320,${20 + offset} 360,${120 + offset} 400,${100 + offset}`}
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray={i % 2 === 0 ? 'none' : '3 3'}
            />
          );
        })}
      </svg>
    );
  }

  if (variant === 'mesh') {
    return (
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        {[...Array(12)].map((_, i) => (
          <ellipse
            key={`e-${i}`}
            cx="150"
            cy="150"
            rx={140 - i * 11}
            ry={40 + i * 9}
            transform={`rotate(${i * 15} 150 150)`}
            stroke="currentColor"
            strokeWidth="0.65"
          />
        ))}
      </svg>
    );
  }

  if (variant === 'crosshair') {
    return (
      <div className={`flex items-center gap-1.5 font-mono-tech text-[10px] text-white/30 select-none ${className}`} aria-hidden="true">
        <span>+</span>
        <span className="w-6 h-px bg-white/20" />
        <span>::</span>
        <span className="w-6 h-px bg-white/20" />
        <span>+</span>
      </div>
    );
  }

  // Default: Topography contour curves (inspired by reference image)
  return (
    <svg
      viewBox="0 0 500 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {[...Array(14)].map((_, i) => {
        const delta = i * 7;
        const amplitude = 35 + Math.sin(i * 0.4) * 20;
        return (
          <path
            key={i}
            d={`M 10,${40 + delta} Q 130,${15 + delta * 0.6 - amplitude} 250,${90 + delta * 0.9} T 490,${50 + delta * 0.7}`}
            stroke="currentColor"
            strokeWidth="0.7"
          />
        );
      })}
    </svg>
  );
};
