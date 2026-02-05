import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0 to 100
  color?: string;
  trackColor?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  radius,
  stroke,
  progress,
  color = 'currentColor',
  trackColor = 'rgba(0,0,0,0.1)',
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg]"
      >
        <circle
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
