
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ScriptDisplay } from './components/ScriptDisplay';
import { AudioControls } from './components/AudioControls';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { AppTitle } from './components/AppTitle';
import { StatisticsDisplay } from './components/StatisticsDisplay';
import { SettingsModal } from './components/SettingsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { getPlaybackStats, updatePlaybackStat, clearPlaybackStats, PlaybackStats } from './services/localStorageService';
import { createScriptId, createScriptName } from './utils/scriptUtils';

export interface SentencePair {
  english: string;
  russian: string;
}

interface ScriptItem {
    id: string;
    name: string;
    content: SentencePair[];
}

// Helper function to parse bilingual script content
const parseBilingualScript = (fileContent: string): SentencePair[] | null => {
  const potentialPairs: SentencePair[] = [];
  const normalizedContent = fileContent.replace(/\r\n/g, '\n').trim();

  if (!normalizedContent) return null;

  const blocks = normalizedContent.split(/\n---\n/);

  if (blocks.length === 1 && (!blocks[0].includes('ENG:') || !blocks[0].includes('RUS:'))) {
    const lines = blocks[0].trim().split('\n');
    let english: string | null = null;
    let russian: string | null = null;
    let foundEng = false;
    let foundRus = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('ENG: ')) {
        english = trimmedLine.substring(5).trim();
        foundEng = true;
      } else if (trimmedLine.startsWith('RUS: ')) {
        russian = trimmedLine.substring(5).trim();
        foundRus = true;
      }
    }
    if (foundEng && foundRus && english !== null && russian !== null) {
      return [{ english, russian }];
    }
    return null; 
  }


  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let english: string | null = null;
    let russian: string | null = null;
    let foundEng = false;
    let foundRus = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('ENG: ')) {
        english = trimmedLine.substring(5).trim();
        foundEng = true;
      } else if (trimmedLine.startsWith('RUS: ')) {
        russian = trimmedLine.substring(5).trim();
        foundRus = true;
      }
    }

    if (foundEng && foundRus && english !== null && russian !== null) {
      potentialPairs.push({ english, russian });
    } else {
      return null;
    }
  }
  return potentialPairs.length > 0 ? potentialPairs : null;
};

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.043.044a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.044c0 .917.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.044.043a1.875 1.875 0 0 0 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.044c.917 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.043-.044a1.875 1.875 0 0 0 .2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.092a1.875 1.875 0 0 0 1.566-1.849v-.044c0-.917-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.044-.043a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.092-.55a1.875 1.875 0 0 0-1.849-1.566h-.044ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
    </svg>
);

const AndroidIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M16.63 13.92a.96.96 0 1 1-1.91 0 .96.96 0 0 1 1.91 0zm-7.34 0a.96.96 0 1 1-1.91 0 .96.96 0 0 1 1.91 0zm8.38-4.47l1.52-2.63a.47.47 0 0 0-.17-.64.47.47 0 0 0-.64.17l-1.54 2.67a11.16 11.16 0 0 0-9.68 0L7.18 6.35a.47.47 0 0 0-.64-.17.47.47 0 0 0-.17.64l1.52 2.63A11.37 11.37 0 0 0 2 15.69h20a11.37 11.37 0 0 0-5.83-6.24zM5.5 17.5h13v.83h-13V17.5z" />
    </svg>
);


const App: React.FC = () => {
  // Replaces simple sentencePairs state with a list of loaded scripts
  const [uploadedScripts, setUploadedScripts] = useState<ScriptItem[]>([]);
  const [currentScriptIndex, setCurrentScriptIndex] = useState<number>(0);
  const [isSequentialFilesEnabled, setIsSequentialFilesEnabled] = useState<boolean>(true);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(false);

  const [fileProcessing, setFileProcessing] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const [basePauseDurationInput, setBasePauseDurationInput] = useState<string>('2');
  const [isRandomOrder, setIsRandomOrder] = useState<boolean>(true); 
  const [maxSentencesToPlayInput, setMaxSentencesToPlayInput] = useState<string>('');
  const [isDynamicPauseEnabled, setIsDynamicPauseEnabled] = useState<boolean>(true);
  const [isMakePauseEnabled, setIsMakePauseEnabled] = useState<boolean>(true);
  const [isContinueAfterTranslationEnabled, setIsContinueAfterTranslationEnabled] = useState<boolean>(false);
  const [russianSpeedInput, setRussianSpeedInput] = useState<string>('1');
  const [englishSpeedInput, setEnglishSpeedInput] = useState<string>('0.8');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallSupported, setIsInstallSupported] = useState<boolean>(false);

  const [stats, setStats] = useState<PlaybackStats>(getPlaybackStats());

  // Derived state for the currently active playback content
  const activeSentencePairs = useMemo(() => {
    if (uploadedScripts.length === 0) return null;

    if (isSequentialFilesEnabled) {
      // Return only the current script's content
      return uploadedScripts[currentScriptIndex]?.content || null;
    } else {
      // Flatten all scripts into one
      return uploadedScripts.flatMap(s => s.content);
    }
  }, [uploadedScripts, isSequentialFilesEnabled, currentScriptIndex]);

  // Derived state for the script info (ID/Name) for statistics
  const activeScriptInfo = useMemo(() => {
    if (uploadedScripts.length === 0) return null;

    if (isSequentialFilesEnabled) {
      // Identify by the specific file
      const current = uploadedScripts[currentScriptIndex];
      return current ? { id: current.id, name: current.name } : null;
    } else {
      // Identify by the combined content
      const allPairs = uploadedScripts.flatMap(s => s.content);
      const id = createScriptId(allPairs);
      // Create a combined name or use the first filename + " (Combined)"
      let name = uploadedScripts[0].name;
      if (uploadedScripts.length > 1) {
          name = `${uploadedFileName || "Multi-file Upload"} (Combined)`;
      } else {
          name = createScriptName(allPairs, uploadedFileName);
      }
      return { id, name };
    }
  }, [uploadedScripts, isSequentialFilesEnabled, currentScriptIndex, uploadedFileName]);

  // Global Screen Wake Lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLockRef.current && !wakeLockRef.current.released) {
            return;
        }

        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        console.log('Global Screen Wake Lock acquired');
        
        lock.addEventListener('release', () => {
          console.log('Global Screen Wake Lock released');
          wakeLockRef.current = null;
        });
      } catch (err: any) {
        console.debug('Wake Lock request failed:', err.name, err.message);
      }
    } else {
        console.debug('Wake Lock API not supported in this browser.');
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
      if (wakeLockRef.current) {
          try {
              await wakeLockRef.current.release();
              wakeLockRef.current = null;
          } catch (err) {
              console.error('Failed to release wake lock', err);
          }
      }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    const handleInteraction = () => {
        requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    // Initial request
    requestWakeLock();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (isAudioPlaying) {
      requestWakeLock();
    }
  }, [isAudioPlaying, requestWakeLock]);

  useEffect(() => {
    // On mobile, when focus mode is active, add a class to the body to remove padding.
    // This allows the fixed focus mode container to fill the entire screen without margins.
    if (isFocusMode) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }

    return () => {
      document.body.classList.remove('focus-mode-active');
    };
  }, [isFocusMode]);

  // Handle Android PWA installation promote lifecycle
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallSupported(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstallSupported(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.debug(`User companion install outcome: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallSupported(false);
      setIsAndroidModalOpen(false);
    }
  }, [deferredPrompt]);

  const handlePlaybackStart = useCallback(() => {
    if (activeScriptInfo) {
      const newStats = updatePlaybackStat(activeScriptInfo.id, activeScriptInfo.name);
      setStats(newStats);
    }
  }, [activeScriptInfo]);

  const handleSequenceFinished = useCallback(() => {
    if (isSequentialFilesEnabled) {
      if (currentScriptIndex < uploadedScripts.length - 1) {
        // Move to next script
        setCurrentScriptIndex(prev => prev + 1);
        setAutoPlayNext(true); // Tell AudioControls to start playing immediately
      } else {
        // End of all files
        setAutoPlayNext(false);
      }
    }
  }, [isSequentialFilesEnabled, currentScriptIndex, uploadedScripts.length]);

  const handleClearStats = useCallback(() => {
    setStats(clearPlaybackStats());
  }, []);

  const handleEnterFocusMode = useCallback(() => {
    if (window.innerWidth < 640) { // sm breakpoint
      setIsFocusMode(true);
    }
  }, []);

  const handleExitFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  const handleBasePauseDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasePauseDurationInput(e.target.value);
  };

  const getNumericBasePauseDuration = (): number => {
    if (basePauseDurationInput.trim() === '') return 2;
    const value = parseFloat(basePauseDurationInput);
    return !isNaN(value) && value >= 0 ? value : 2;
  };

  const handleRandomOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRandomOrder(e.target.checked);
  };

  const handleDynamicPauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDynamicPauseEnabled(e.target.checked);
  };

  const handleMakePauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMakePauseEnabled(e.target.checked);
  };

  const handleContinueAfterTranslationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsContinueAfterTranslationEnabled(e.target.checked);
  };
  
  const handleSequentialFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsSequentialFilesEnabled(e.target.checked);
      // Reset index when toggling mode
      setCurrentScriptIndex(0);
      setAutoPlayNext(false);
  };

  const handleMaxSentencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxSentencesToPlayInput(e.target.value);
  };
  
  const getMaxSentencesToPlay = (): number | null => {
    if (maxSentencesToPlayInput.trim() === '') return null;
    const num = parseInt(maxSentencesToPlayInput, 10);
    return !isNaN(num) && num > 0 ? num : null;
  };

  const handleRussianSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRussianSpeedInput(e.target.value);
  };

  const getNumericRussianSpeed = (): number => {
    if (russianSpeedInput.trim() === '') return 1;
    const value = parseFloat(russianSpeedInput);
    return !isNaN(value) && value >= 0.1 && value <= 10 ? value : 1;
  };

  const handleEnglishSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnglishSpeedInput(e.target.value);
  };

  const getNumericEnglishSpeed = (): number => {
    if (englishSpeedInput.trim() === '') return 0.8;
    const value = parseFloat(englishSpeedInput);
    return !isNaN(value) && value >= 0.1 && value <= 10 ? value : 0.8;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fileProcessing) return;
    const files = e.target.files;

    if (files && files.length > 0) {
        const fileList = Array.from(files) as File[];
        // Sort files by name to ensure consistent sequential order
        fileList.sort((a, b) => a.name.localeCompare(b.name));

        const fileNames = fileList.map(f => f.name).join(', ');
        setUploadedFileName(fileNames);

        const textFiles = fileList.filter(f => f.type === "text/plain");

        if (textFiles.length === 0) {
            setError("No valid .txt files selected. Please upload at least one .txt file.");
            setUploadedFileName(null);
            e.target.value = '';
            return;
        }

        if (textFiles.length < files.length) {
            setError("Some selected files were not .txt and were ignored.");
        } else {
            setError(null);
        }

        setFileProcessing(true);
        setUploadedScripts([]);
        setCurrentScriptIndex(0);
        setAutoPlayNext(false);
        
        try {
            const newScripts: ScriptItem[] = [];

            for (const file of textFiles) {
                const content = await file.text();
                const parsedPairs = parseBilingualScript(content);
                
                if (parsedPairs) {
                    newScripts.push({
                        id: createScriptId(parsedPairs),
                        name: file.name,
                        content: parsedPairs
                    });
                }
            }

            if (newScripts.length > 0) {
                setUploadedScripts(newScripts);
            } else {
                // No valid bilingual scripts found.
                setError("No valid bilingual scripts found. Please upload .txt files with 'ENG: ...' and 'RUS: ...' pairs (optionally separated by '---').");
                setUploadedScripts([]);
                setUploadedFileName(null);
            }
        } catch (readError) {
            console.error("Error reading or parsing files:", readError);
            setError("Could not read or parse one or more of the uploaded files.");
            setUploadedFileName(null); 
            setUploadedScripts([]);
        } finally {
            setFileProcessing(false);
        }
      
      e.target.value = ''; 
    }
  };

  return (
    <div className="container mx-auto p-6 bg-slate-800 shadow-2xl rounded-lg border border-slate-700">
      
      <div className={isFocusMode ? 'hidden sm:block' : ''}>
        <AppTitle />
        
        <div className="my-4">
          <label htmlFor="uploadScript" className="block text-sm font-medium text-slate-300 mb-1">
            {uploadedFileName ? (
              <>
                Uploaded Script(s): <span className="font-semibold text-sky-400">{uploadedFileName}</span>
              </>
            ) : (
              <span className="hidden sm:inline">Upload Script(s) (.txt): Bilingual (ENG/RUS pairs separated by '---')</span>
            )}
          </label>
          <div className="flex space-x-2">
            <input
              type="file"
              id="uploadScript"
              accept=".txt"
              multiple
              onChange={handleFileUpload}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-600 file:text-sm file:font-semibold file:bg-slate-700 file:text-sky-300 hover:file:bg-slate-600 disabled:opacity-50 cursor-pointer"
              disabled={fileProcessing || isAudioPlaying}
              aria-label="Upload one or more bilingual ENG/RUS script text files"
            />
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sky-400 border border-slate-600 rounded-md transition-colors"
                aria-label="Open Settings"
                disabled={fileProcessing || isAudioPlaying}
            >
                <SettingsIcon />
            </button>
            <button
                onClick={() => setIsAndroidModalOpen(true)}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-md transition-colors flex items-center space-x-1"
                aria-label="Установить на Android"
                disabled={fileProcessing || isAudioPlaying}
            >
                <AndroidIcon />
                <span className="text-xs font-semibold hidden sm:inline">Android App</span>
            </button>
          </div>
        </div>

        {/* Replaced original settings block with empty space, settings are now in SettingsModal */}

        {fileProcessing && <LoadingSpinner text="Processing file..." />}
        {error && <ErrorMessage message={error} />}
        
        {/* StatisticsDisplay was here, moved to bottom */}
      </div>

      <div className={
        isFocusMode 
          ? 'fixed sm:relative inset-0 sm:inset-auto z-50 bg-gradient-to-br from-slate-900 to-slate-800 sm:bg-transparent flex flex-col h-full sm:h-auto p-4 sm:p-0'
          : ''
      }>
        {activeSentencePairs && !fileProcessing && (
          <div className={`
            ${isFocusMode ? 'w-full max-w-lg flex-1 flex flex-col' : 'w-full mt-8 space-y-6'}
          `}>
            {/* Show info about current file if in sequential mode, BUT HIDE IN FOCUS MODE */}
            
            <div className={isFocusMode ? 'hidden' : ''}>
              {!isAudioPlaying && (
                <ScriptDisplay script={activeSentencePairs.map(p => p.russian).join('\n')} />
              )}
            </div>
            <AudioControls 
              sentencePairs={activeSentencePairs} 
              basePauseDuration={getNumericBasePauseDuration()}
              isRandomOrder={isRandomOrder}
              maxSentencesToPlay={getMaxSentencesToPlay()}
              isDynamicPauseEnabled={isDynamicPauseEnabled}
              isMakePauseEnabled={isMakePauseEnabled}
              isContinueAfterTranslationEnabled={isContinueAfterTranslationEnabled}
              russianSpeed={getNumericRussianSpeed()}
              englishSpeed={getNumericEnglishSpeed()}
              onPlaybackStatusChange={setIsAudioPlaying}
              onPlaybackStart={handlePlaybackStart}
              onSequenceFinished={handleSequenceFinished}
              autoPlayOnMount={autoPlayNext}
              onEnterFocusMode={handleEnterFocusMode}
              onExitFocusMode={handleExitFocusMode}
              isFocusMode={isFocusMode}
            />
          </div>
        )}
      </div>

      <div className={isFocusMode ? 'hidden' : 'mt-8'}>
        <StatisticsDisplay stats={stats} onClear={handleClearStats} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        basePauseDurationInput={basePauseDurationInput}
        onBasePauseDurationChange={handleBasePauseDurationChange}
        maxSentencesToPlayInput={maxSentencesToPlayInput}
        onMaxSentencesChange={handleMaxSentencesChange}
        russianSpeedInput={russianSpeedInput}
        onRussianSpeedChange={handleRussianSpeedChange}
        englishSpeedInput={englishSpeedInput}
        onEnglishSpeedChange={handleEnglishSpeedChange}
        isRandomOrder={isRandomOrder}
        onRandomOrderChange={handleRandomOrderChange}
        isDynamicPauseEnabled={isDynamicPauseEnabled}
        onDynamicPauseChange={handleDynamicPauseChange}
        isMakePauseEnabled={isMakePauseEnabled}
        onMakePauseChange={handleMakePauseChange}
        isSequentialFilesEnabled={isSequentialFilesEnabled}
        onSequentialFilesChange={handleSequentialFilesChange}
        isContinueAfterTranslationEnabled={isContinueAfterTranslationEnabled}
        onContinueAfterTranslationChange={handleContinueAfterTranslationChange}
        disabled={fileProcessing || isAudioPlaying}
      />

      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onInstall={handleNativeInstall}
        isInstallSupported={isInstallSupported}
      />

    </div>
  );
};

export default App;
