import React from 'react';

interface ScoreGaugeProps {
  score: number;
  grade: string;
  statusLabel: string;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  grade,
  statusLabel,
  size = 180,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semicircular or 270-degree gauge. Let's do a 260-degree open gauge for elegant instrument look!
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // emerald-500
  let textColor = 'text-emerald-700';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (score < 50) {
    strokeColor = '#f43f5e'; // rose-500
    textColor = 'text-rose-700';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (score < 70) {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (score < 85) {
    strokeColor = '#0284c7'; // sky-600
    textColor = 'text-sky-700';
    badgeBg = 'bg-sky-50 text-sky-800 border-sky-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Filled progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400 -mt-0.5">
            OUT OF 100
          </span>
          <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
            Grade {grade}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className={`text-sm font-semibold ${textColor}`}>
          {statusLabel}
        </p>
      </div>
    </div>
  );
};
