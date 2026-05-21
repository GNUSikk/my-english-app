import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  if (total === 0) return null;

  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full my-2" aria-label={label || 'Playback progress'}>
      <div className="flex justify-between mb-1 text-xs text-slate-300">
        <span data-testid="progress-current-total">{`${current} / ${total}`}</span>
        <span data-testid="progress-percentage">{percentage.toFixed(0)}%</span>
      </div>
      <div
        className="w-full bg-slate-600 rounded-full h-2.5"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={`${percentage.toFixed(0)}% complete`}
        data-testid="progress-bar-container"
      >
        <div
          className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar-fill"
        ></div>
      </div>
    </div>
  );
};
