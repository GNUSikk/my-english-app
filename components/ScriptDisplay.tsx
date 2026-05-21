
import React from 'react';

interface ScriptDisplayProps {
  script: string;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script }) => {
  return (
    <div className="hidden sm:block">
      <h2 className="text-2xl font-semibold mb-3 text-sky-400">Translated Script (Russian):</h2>
      <div className="p-4 bg-slate-700 border border-slate-600 rounded-md shadow whitespace-pre-wrap text-slate-200 max-h-96 overflow-y-auto" lang="ru">
        {script}
      </div>
    </div>
  );
};
