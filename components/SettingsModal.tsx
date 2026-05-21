
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  basePauseDurationInput: string;
  onBasePauseDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxSentencesToPlayInput: string;
  onMaxSentencesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  russianSpeedInput: string;
  onRussianSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  englishSpeedInput: string;
  onEnglishSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRandomOrder: boolean;
  onRandomOrderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDynamicPauseEnabled: boolean;
  onDynamicPauseChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMakePauseEnabled: boolean;
  onMakePauseChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSequentialFilesEnabled: boolean;
  onSequentialFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isContinueAfterTranslationEnabled: boolean;
  onContinueAfterTranslationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  basePauseDurationInput,
  onBasePauseDurationChange,
  maxSentencesToPlayInput,
  onMaxSentencesChange,
  russianSpeedInput,
  onRussianSpeedChange,
  englishSpeedInput,
  onEnglishSpeedChange,
  isRandomOrder,
  onRandomOrderChange,
  isDynamicPauseEnabled,
  onDynamicPauseChange,
  isMakePauseEnabled,
  onMakePauseChange,
  isSequentialFilesEnabled,
  onSequentialFilesChange,
  isContinueAfterTranslationEnabled,
  onContinueAfterTranslationChange,
  disabled
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-sky-400">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-start">
            <div>
              <label htmlFor="basePauseDuration" className="block text-sm font-medium text-slate-300 mb-1">
                Base Pause (sec):
              </label>
              <input
                type="number"
                id="basePauseDuration"
                name="basePauseDuration"
                value={basePauseDurationInput}
                onChange={onBasePauseDurationChange}
                min="0"
                step="0.1"
                placeholder="e.g. 2.0 (default)"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                disabled={disabled}
              />
            </div>
            <div>
              <label htmlFor="maxSentences" className="block text-sm font-medium text-slate-300 mb-1">
                Play Pairs (max):
              </label>
              <input
                type="number"
                id="maxSentences"
                name="maxSentences"
                value={maxSentencesToPlayInput}
                onChange={onMaxSentencesChange}
                min="1"
                step="1"
                placeholder="All"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                disabled={disabled}
              />
            </div>
            <div>
              <label htmlFor="russianSpeed" className="block text-sm font-medium text-slate-300 mb-1">
                Russian Speed:
              </label>
              <input
                type="number"
                id="russianSpeed"
                name="russianSpeed"
                value={russianSpeedInput}
                onChange={onRussianSpeedChange}
                min="0.1"
                max="10"
                step="0.1"
                placeholder="1.0 (default)"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                disabled={disabled}
              />
            </div>
            <div>
              <label htmlFor="englishSpeed" className="block text-sm font-medium text-slate-300 mb-1">
                English Speed:
              </label>
              <input
                type="number"
                id="englishSpeed"
                name="englishSpeed"
                value={englishSpeedInput}
                onChange={onEnglishSpeedChange}
                min="0.1"
                max="10"
                step="0.1"
                placeholder="0.8 (default)"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-700/50">
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomOrder"
                  name="randomOrder"
                  checked={isRandomOrder}
                  onChange={onRandomOrderChange}
                  className="h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-500 bg-slate-700 cursor-pointer"
                  disabled={disabled}
                />
                <label htmlFor="randomOrder" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">
                  Random Order
                </label>
            </div>
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dynamicPause"
                  name="dynamicPause"
                  checked={isDynamicPauseEnabled}
                  onChange={onDynamicPauseChange}
                  className="h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-500 bg-slate-700 cursor-pointer"
                  disabled={disabled}
                />
                <label htmlFor="dynamicPause" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">
                  Enable Dynamic Pause
                </label>
            </div>
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="makePause"
                  name="makePause"
                  checked={isMakePauseEnabled}
                  onChange={onMakePauseChange}
                  className="h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-500 bg-slate-700 cursor-pointer"
                  disabled={disabled}
                />
                <label htmlFor="makePause" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">
                  Make Pause
                </label>
            </div>
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sequentialFiles"
                  name="sequentialFiles"
                  checked={isSequentialFilesEnabled}
                  onChange={onSequentialFilesChange}
                  className="h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-500 bg-slate-700 cursor-pointer"
                  disabled={disabled}
                />
                <label htmlFor="sequentialFiles" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">
                  Play Files Sequentially
                </label>
            </div>
            <div className="flex items-center">
                <input
                  type="checkbox"
                  id="continueAfterTranslation"
                  name="continueAfterTranslation"
                  checked={isContinueAfterTranslationEnabled}
                  onChange={onContinueAfterTranslationChange}
                  className="h-5 w-5 rounded border-slate-500 text-sky-500 focus:ring-sky-500 bg-slate-700 cursor-pointer"
                  disabled={disabled}
                />
                <label htmlFor="continueAfterTranslation" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">
                  Continue after Translation
                </label>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md shadow transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
