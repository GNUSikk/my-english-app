
import React, { useState, useEffect } from 'react';

interface SentenceInputProps {
  onSubmit: (sentences: string) => void;
  isLoading: boolean;
  initialValue: string;
  onInputChange: (value: string) => void;
}

export const SentenceInput: React.FC<SentenceInputProps> = ({ onSubmit, isLoading, initialValue, onInputChange }) => {
  const [localSentences, setLocalSentences] = useState(initialValue);

  // Sync localSentences with initialValue prop when it changes (e.g., after file upload)
  useEffect(() => {
    setLocalSentences(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(localSentences);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalSentences(e.target.value);
    onInputChange(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sentences" className="block text-sm font-medium text-slate-300 mb-1">
          Enter English sentences (one per line):
        </label>
        <textarea
          id="sentences"
          value={localSentences}
          onChange={handleChange}
          rows={6}
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
          placeholder="e.g., Hello, how are you?\nIs this an example question?\nLearning new languages is fun."
          disabled={isLoading}
          aria-label="Enter English sentences, one per line"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !localSentences.trim()}
        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Translating...
          </>
        ) : (
          'Translate to Russian & Prepare Audio'
        )}
      </button>
    </form>
  );
};
