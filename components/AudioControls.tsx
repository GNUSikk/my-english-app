
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { SentencePair } from '../App'; 
import { ProgressBar } from './ProgressBar'; 
import { removeDigits, removeLeadingMetadata } from '../utils/scriptUtils';

// Define SpeechRecognition types safely for TypeScript
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

// SVG Icons
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5 mr-2"}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5 mr-2"}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5 mr-2"}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5 mr-2"}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface AudioControlsProps {
  sentencePairs: SentencePair[] | null;
  basePauseDuration: number;
  isRandomOrder: boolean;
  maxSentencesToPlay: number | null;
  isDynamicPauseEnabled: boolean;
  isMakePauseEnabled: boolean;
  isContinueAfterTranslationEnabled: boolean;
  russianSpeed: number;
  englishSpeed: number;
  autoPlayOnMount?: boolean; 
  onPlaybackStatusChange?: (isActive: boolean) => void;
  onPlaybackStart?: () => void;
  onSequenceFinished?: () => void; 
  onEnterFocusMode?: () => void;
  onExitFocusMode?: () => void;
  isFocusMode?: boolean;
}

type PlaybackState = 
  | "idle" 
  | "announcing_question_cue_before_russian"
  | "paused_after_question_cue_before_russian"
  | "playing_russian" 
  | "paused_after_russian_before_english"
  | "playing_english" 
  | "finished";

const QUESTION_CUE = "Вопрос. "; // Added dot for better engine separation
const QUESTION_CUE_PAUSE_DURATION_MS = 1000; 

const PER_CHAR_PAUSE_MS = 50; 
const MAX_PAUSE_MS = 10000; 

export const AudioControls: React.FC<AudioControlsProps> = ({ 
  sentencePairs, 
  basePauseDuration, 
  isRandomOrder, 
  maxSentencesToPlay,
  isDynamicPauseEnabled,
  isMakePauseEnabled,
  isContinueAfterTranslationEnabled,
  russianSpeed,
  englishSpeed,
  autoPlayOnMount = false,
  onPlaybackStatusChange,
  onPlaybackStart,
  onSequenceFinished,
  onEnterFocusMode,
  onExitFocusMode,
  isFocusMode
}) => {
  const [canUseSpeechSynthesis, setCanUseSpeechSynthesis] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [currentPlaybackOrder, setCurrentPlaybackOrder] = useState<SentencePair[] | null>(null);
  const [isUserPaused, setIsUserPaused] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [unplayedDeck, setUnplayedDeck] = useState<SentencePair[] | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  const pauseTimeoutRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastCalculatedPauseMsRef = useRef<number>(basePauseDuration * 1000);
  const stateBeforeUserPauseRef = useRef<PlaybackState | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (sentencePairs && sentencePairs.length > 0) {
      const newDeck = isRandomOrder ? shuffleArray([...sentencePairs]) : [...sentencePairs];
      setUnplayedDeck(newDeck);
    } else {
      setUnplayedDeck(null);
    }
  }, [sentencePairs, isRandomOrder]);

  useEffect(() => {
    isMountedRef.current = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setCanUseSpeechSynthesis(true);
    }
    return () => {
      isMountedRef.current = false;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (onPlaybackStatusChange) {
      const isActive = playbackState !== "idle" && playbackState !== "finished";
      onPlaybackStatusChange(isActive);
    }
  }, [playbackState, onPlaybackStatusChange]);

  const speak = useCallback((text: string, lang: string, onEndCallback: () => void) => {
    if (!canUseSpeechSynthesis || !isMountedRef.current || isUserPaused) return;
    
    if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
    }

    // Only cancel if there is active or pending speech to minimize engine reset overhead
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel(); 
    }

    if (text.trim() === '') {
        if (isMountedRef.current) onEndCallback();
        return;
    }

    // Increased delay to 350ms to allow audio hardware and software buffers to stabilize.
    // This is the most effective way to prevent "swallowing" starts of sentences.
    speechTimeoutRef.current = window.setTimeout(() => {
        if (!isMountedRef.current || isUserPaused) return;

        // Prepend a space to text. This acts as a "silent trigger" to ensure the
        // audio stream is active before the first phoneme is produced.
        const utterance = new SpeechSynthesisUtterance(" " + text);
        currentUtteranceRef.current = utterance;

        utterance.lang = lang;
        utterance.rate = lang === 'ru-RU' ? russianSpeed : (lang === 'en-US' ? englishSpeed : 1);

        utterance.onend = () => {
          currentUtteranceRef.current = null;
          if (isMountedRef.current) {
            // Small additional delay after physical end of speech before triggering next logic
            setTimeout(() => {
                if (isMountedRef.current) onEndCallback();
            }, 100);
          }
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          currentUtteranceRef.current = null;
          if (!isMountedRef.current || event.error === 'interrupted' || event.error === 'canceled') return;

          console.error(`SpeechSynthesis Error: ${event.error}`);
          setAudioError(`Audio error: ${event.error}`);
          handleStop();
        };
        
        window.speechSynthesis.speak(utterance);
    }, 350); 
  }, [canUseSpeechSynthesis, russianSpeed, englishSpeed, isUserPaused]);

  const handleStop = useCallback(() => {
    if (!canUseSpeechSynthesis) return;
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setPlaybackState("idle");
    setCurrentSentenceIndex(0); 
    setCurrentPlaybackOrder(null);
    setIsUserPaused(false); 
    stateBeforeUserPauseRef.current = null;
    setAudioError(null);
    onExitFocusMode?.();
  }, [canUseSpeechSynthesis, onExitFocusMode]);
  
  const handlePlay = useCallback(async () => {
    if (!sentencePairs || sentencePairs.length === 0 || !canUseSpeechSynthesis) return;
    onPlaybackStart?.();
    onEnterFocusMode?.();
    setAudioError(null);
    setIsUserPaused(false);
    setIsListening(false);
    stateBeforeUserPauseRef.current = null;
    
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    window.speechSynthesis.cancel();
    
    let currentDeck = unplayedDeck;
    if (!currentDeck || currentDeck.length === 0) {
      currentDeck = isRandomOrder ? shuffleArray([...sentencePairs]) : [...sentencePairs];
    }
    
    const numToPlay = maxSentencesToPlay !== null && maxSentencesToPlay > 0
      ? Math.min(maxSentencesToPlay, currentDeck.length)
      : currentDeck.length;

    const orderToPlay = currentDeck.slice(0, numToPlay);
    setUnplayedDeck(currentDeck.slice(numToPlay));

    if (orderToPlay.length === 0) {
        setPlaybackState("finished");
        onExitFocusMode?.();
        return;
    }

    setCurrentPlaybackOrder(orderToPlay);
    setCurrentSentenceIndex(0);
    
    const firstPair = orderToPlay[0];
    const firstEnglishAfterMetadata = removeLeadingMetadata(firstPair.english);
    setPlaybackState(firstEnglishAfterMetadata.endsWith('?') ? "announcing_question_cue_before_russian" : "playing_russian");

  }, [unplayedDeck, sentencePairs, canUseSpeechSynthesis, isRandomOrder, maxSentencesToPlay, onPlaybackStart, onEnterFocusMode, onExitFocusMode]);

  useEffect(() => {
    handleStop();
    if (autoPlayOnMount && sentencePairs && sentencePairs.length > 0) {
        const timer = setTimeout(() => handlePlay(), 100);
        return () => clearTimeout(timer);
    }
  }, [sentencePairs, autoPlayOnMount]);

  useEffect(() => {
    if (!isMountedRef.current || !currentPlaybackOrder || !canUseSpeechSynthesis || isUserPaused) return;

    const isPlaybackBeyondPairs = currentSentenceIndex >= currentPlaybackOrder.length;
    if (isPlaybackBeyondPairs && playbackState !== "idle" && playbackState !== "finished") {
        setPlaybackState("finished");
        if (onSequenceFinished) onSequenceFinished();
        onExitFocusMode?.();
        return;
    }
    
    const currentPair = !isPlaybackBeyondPairs ? currentPlaybackOrder[currentSentenceIndex] : null;

    switch (playbackState) {
      case "announcing_question_cue_before_russian":
        if (!currentPair) return;
        speak(QUESTION_CUE, 'ru-RU', () => {
          if (isMountedRef.current && !isUserPaused) setPlaybackState("paused_after_question_cue_before_russian");
        });
        break;

      case "paused_after_question_cue_before_russian":
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current && !isUserPaused) setPlaybackState("playing_russian");
        }, QUESTION_CUE_PAUSE_DURATION_MS);
        break;

      case "playing_russian":
        if (!currentPair) return;
        speak(currentPair.russian, 'ru-RU', () => {
          if (isMountedRef.current && !isUserPaused) setPlaybackState("paused_after_russian_before_english");
        });
        break;

      case "paused_after_russian_before_english":
        if (!currentPair) return; 
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        
        if (isContinueAfterTranslationEnabled) {
          const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;
          if (SpeechRecognition) {
            setIsListening(true);
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.lang = 'en-US'; 
            let speechDetected = false;
            recognition.onspeechend = () => { speechDetected = true; };
            recognition.onend = () => {
               if (recognitionRef.current !== recognition) return;
               if (speechDetected) {
                 setIsListening(false);
                 recognitionRef.current = null;
                 pauseTimeoutRef.current = window.setTimeout(() => {
                    if (isMountedRef.current && !isUserPaused) setPlaybackState("playing_english");
                  }, 1000); 
               } else if (isMountedRef.current && !isUserPaused && playbackState === "paused_after_russian_before_english") {
                    try { recognition.start(); } catch (e) { setIsUserPaused(true); }
               }
            };
            try { recognition.start(); } catch (err) { setIsUserPaused(true); }
            return;
          }
        }
        
        if (isMakePauseEnabled) {
            stateBeforeUserPauseRef.current = "paused_after_russian_before_english";
            setIsUserPaused(true);
            return;
        }

        const basePauseMs = basePauseDuration * 1000; 
        let totalCalculatedPauseMs = basePauseMs;
        if (isDynamicPauseEnabled) {
          totalCalculatedPauseMs = Math.min(MAX_PAUSE_MS, basePauseMs + (currentPair.russian.length * PER_CHAR_PAUSE_MS));
        }
        lastCalculatedPauseMsRef.current = totalCalculatedPauseMs;

        pauseTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current && !isUserPaused) setPlaybackState("playing_english");
        }, totalCalculatedPauseMs);
        break;

      case "playing_english":
        if (!currentPair) return;
        const englishText = removeDigits(removeLeadingMetadata(currentPair.english));
        speak(englishText || "[empty English sentence]", 'en-US', () => {
          if (isMountedRef.current && !isUserPaused) {
            const nextIndex = currentSentenceIndex + 1;
            if (nextIndex < currentPlaybackOrder.length) {
              setCurrentSentenceIndex(nextIndex);
              const nextPair = currentPlaybackOrder[nextIndex];
              setPlaybackState(removeLeadingMetadata(nextPair.english).endsWith('?') ? "announcing_question_cue_before_russian" : "playing_russian");
            } else {
              setCurrentSentenceIndex(nextIndex); 
              setPlaybackState("finished");
              if (onSequenceFinished) onSequenceFinished();
              onExitFocusMode?.();
            }
          }
        });
        break;
      default: break;
    }
  }, [playbackState, currentSentenceIndex, currentPlaybackOrder, speak, canUseSpeechSynthesis, basePauseDuration, isDynamicPauseEnabled, isMakePauseEnabled, isContinueAfterTranslationEnabled, isUserPaused]);

  const handlePauseResume = useCallback(() => {
    if (!canUseSpeechSynthesis) return;
    setAudioError(null);
    if (isUserPaused) { 
      window.speechSynthesis.resume(); 
      let nextState: PlaybackState | null = null;
      if (stateBeforeUserPauseRef.current === "paused_after_question_cue_before_russian") {
        nextState = (currentPlaybackOrder && currentPlaybackOrder[currentSentenceIndex]) ? "playing_russian" : "finished";
      } else if (stateBeforeUserPauseRef.current === "paused_after_russian_before_english") {
        nextState = (currentPlaybackOrder && currentPlaybackOrder[currentSentenceIndex]) 
          ? (isContinueAfterTranslationEnabled ? "paused_after_russian_before_english" : "playing_english") 
          : "finished";
      }
      stateBeforeUserPauseRef.current = null; 
      if (nextState) setPlaybackState(nextState);
      setIsUserPaused(false); 
    } else { 
      stateBeforeUserPauseRef.current = playbackState; 
      window.speechSynthesis.pause();
      if (recognitionRef.current) {
          recognitionRef.current.abort();
          setIsListening(false);
      }
      setIsUserPaused(true);
    }
  }, [canUseSpeechSynthesis, isUserPaused, playbackState, currentPlaybackOrder, currentSentenceIndex, isContinueAfterTranslationEnabled]);

  const handleDownloadScript = () => {
    if (!sentencePairs || sentencePairs.length === 0) return;
    const content = sentencePairs.map(p => `ENG: ${removeDigits(removeLeadingMetadata(p.english))}\nRUS: ${p.russian}`).join('\n---\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bilingual_script_eduaudio.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const getStatusMessage = useCallback(() => {
    if (!currentPlaybackOrder || currentPlaybackOrder.length === 0) {
      return playbackState === "finished" ? "Playback finished." : (isUserPaused ? "User Paused. Ready to play." : "Ready to play.");
    }
    if (playbackState === "finished") return "Playback finished.";
    const currentPair = currentPlaybackOrder[currentSentenceIndex];
    if (!currentPair) return "Waiting...";
    const engText = removeDigits(removeLeadingMetadata(currentPair.english));

    if (isUserPaused) {
      const ps = stateBeforeUserPauseRef.current || playbackState;
      if (ps.includes("question_cue")) return `"${QUESTION_CUE.trim()}" (Next: "${currentPair.russian}")`;
      if (ps === "playing_russian") return `"${currentPair.russian}"`;
      if (ps === "paused_after_russian_before_english") return `"${currentPair.russian}" (Next: "${engText}")`;
      if (ps === "playing_english") return `"${engText}"`;
      return "Paused.";
    }
    if (isListening) return "Listening for your translation...";

    switch (playbackState) {
      case "announcing_question_cue_before_russian": return `Announcing: "${QUESTION_CUE.trim()}"`;
      case "paused_after_question_cue_before_russian": return `Preparing sentence...`;
      case "playing_russian": return `Playing Russian: "${currentPair.russian}"`;
      case "paused_after_russian_before_english": return "Pausing for translation...";
      case "playing_english": return `Playing English: "${engText}"`;
      default: return "Ready to play.";
    }
  }, [currentPlaybackOrder, playbackState, currentSentenceIndex, isUserPaused, isListening]); 

  if (!sentencePairs || sentencePairs.length === 0) return null;
  const isPlaybackActive = playbackState !== "idle" && playbackState !== "finished";
  const statusText = isUserPaused || playbackState === "idle" || playbackState === "finished" ? getStatusMessage() : `Status: ${getStatusMessage()}`;

  return (
    <div className={isFocusMode ? 'flex flex-col h-full' : 'mt-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg'}>
      <div className={isFocusMode ? 'flex flex-col flex-1 min-h-0 pb-1' : 'flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3'}>
        {canUseSpeechSynthesis ? (
          <>
            {!isFocusMode && (
                <button onClick={handlePlay} disabled={isPlaybackActive || isUserPaused} className="flex-1 flex items-center justify-center px-4 py-2 border border-green-500 text-green-400 rounded-md hover:bg-green-500 hover:text-slate-900 disabled:opacity-50 text-base transition-colors">
                <PlayIcon className="w-5 h-5 mr-2" /> Play Sequence
                </button>
            )}
            <button
              onClick={handlePauseResume}
              disabled={!isPlaybackActive && !isUserPaused}
              className={`
                ${isFocusMode ? 'flex-1 w-full flex items-center justify-center rounded-xl shadow-xl text-6xl font-bold mb-2' : "flex-1 flex items-center justify-center border rounded-md transition-all duration-150 ease-in-out disabled:opacity-50"}
                ${isFocusMode 
                    ? (isUserPaused ? 'bg-amber-500 text-slate-900 border-4 border-amber-600' : 'bg-orange-600 text-white border-4 border-orange-700') 
                    : (isUserPaused ? "border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900" : "border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-slate-900")
                }
                ${!isFocusMode ? (isPlaybackActive ? 'px-24 py-16 text-6xl font-semibold' : 'px-4 py-2 text-base') : ''}
              `}
            >
              {isUserPaused ? <PlayIcon className={isFocusMode ? "w-24 h-24 mr-4" : (isPlaybackActive ? "w-14 h-14 mr-6" : "w-5 h-5 mr-2")} /> : <PauseIcon className={isFocusMode ? "w-24 h-24 mr-4" : (isPlaybackActive ? "w-14 h-14 mr-6" : "w-5 h-5 mr-2")} />}
              {isUserPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleStop} disabled={!isPlaybackActive && playbackState !== 'finished' && !isUserPaused} className={isFocusMode ? 'w-full py-1 text-sm border border-red-500 text-red-400 rounded' : 'flex-1 flex items-center justify-center border border-red-500 text-red-400 rounded-md hover:bg-red-500 hover:text-slate-900 text-base transition-colors'}>
              <StopIcon className={isFocusMode ? "w-4 h-4 mr-1.5" : "w-5 h-5 mr-2"} /> Stop
            </button>
          </>
        ) : <p className="text-sm text-amber-400">Speech not supported.</p>}
        {!isFocusMode && <button onClick={handleDownloadScript} className="flex-1 flex items-center justify-center px-4 py-2 border border-sky-500 text-sky-400 rounded-md hover:bg-sky-500 hover:text-slate-900 text-base transition-colors"><DownloadIcon className="w-5 h-5 mr-2" /> Download Script</button>}
      </div>
      <div className="mt-3">
          {currentPlaybackOrder && (isPlaybackActive || isUserPaused || playbackState === 'finished') && <ProgressBar current={currentSentenceIndex} total={currentPlaybackOrder.length} />}
          {(playbackState !== "idle" || isUserPaused) && <p className={`text-slate-300 mt-2 ${isPlaybackActive ? "text-2xl font-semibold" : "text-sm"}`}>{statusText}</p>}
          {audioError && <p className="mt-2 text-sm text-red-300 p-2 bg-red-700/30 border border-red-600 rounded-md">{audioError}</p>}
      </div>
    </div>
  );
};
