
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  const displayText = text || "Translating to Russian, please wait...";
  return (
    <div className="flex justify-center items-center my-8" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-sky-400"></div>
      <p className="ml-3 text-slate-300">{displayText}</p>
    </div>
  );
};
