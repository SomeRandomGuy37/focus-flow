import React from 'react';

interface TimerDisplayProps {
  seconds: number;
  variant?: 'large' | 'small' | 'card';
  showLabels?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, variant = 'large', showLabels = true }) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const format = (n: number) => n.toString().padStart(2, '0');

  // We use a specific font-variant-numeric: tabular-nums to ensure digits are the same width
  // preventing layout jitter (glitches) as numbers change.

  if (variant === 'small') {
    return (
      <span className="font-mono tabular-nums text-sm font-bold">
        {format(hrs)}:{format(mins)}:{format(secs)}
      </span>
    );
  }

  if (variant === 'card') {
    // Large, separated blocks design
    return (
      <div className="flex gap-2 w-full justify-center max-w-sm">
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-secondary border border-border shadow-sm">
            <p className="text-3xl font-bold tracking-tight font-mono tabular-nums">{format(hrs)}</p>
          </div>
          {showLabels && <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Hrs</p>}
        </div>
        <div className="flex flex-col justify-start pt-3 h-16">
          <span className="text-muted-foreground text-xl font-light">:</span>
        </div>
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-secondary border border-border shadow-sm">
            <p className="text-3xl font-bold tracking-tight font-mono tabular-nums">{format(mins)}</p>
          </div>
          {showLabels && <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Min</p>}
        </div>
        <div className="flex flex-col justify-start pt-3 h-16">
          <span className="text-muted-foreground text-xl font-light">:</span>
        </div>
        <div className="flex grow basis-0 flex-col items-center gap-2">
          <div className="relative flex h-16 w-full items-center justify-center rounded-2xl bg-secondary border border-primary shadow-sm overflow-hidden">
             {/* Subtle pulse animation for seconds container only */}
            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            <p className="text-3xl font-bold tracking-tight relative z-10 font-mono tabular-nums">{format(secs)}</p>
          </div>
          {showLabels && <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Sec</p>}
        </div>
      </div>
    );
  }

  // Large default (Dashboard style)
  return (
    <div className="flex items-baseline gap-1 font-display select-none justify-center min-w-[300px]">
      {/* We wrap digits in fixed width containers or use monospace to ensure stability */}
      <span className="text-6xl sm:text-7xl font-light tracking-tighter font-mono tabular-nums w-[1.1em] text-center">{format(hrs)}</span>
      <span className="text-6xl sm:text-7xl font-light opacity-20 pb-2">:</span>
      <span className="text-6xl sm:text-7xl font-light tracking-tighter font-mono tabular-nums w-[1.1em] text-center">{format(mins)}</span>
      <span className="text-6xl sm:text-7xl font-light opacity-20 pb-2">:</span>
      <span className="text-6xl sm:text-7xl font-light tracking-tighter font-mono tabular-nums w-[1.1em] text-center">{format(secs)}</span>
    </div>
  );
};
