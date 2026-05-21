import type { SentencePair } from '../App';

// These functions are used to create a consistent ID and for playback.
export const removeLeadingMetadata = (text: string): string => {
  // Removes metadata like "12:34 - 1. " from the start of a string.
  const metadataRegex = /^\d{1,2}:\d{2}\s*-\s*\d+\.\s*/;
  return text.replace(metadataRegex, '').trim();
};

export const removeDigits = (text: string): string => {
  // Removes all digits from a string.
  return text.replace(/\d/g, '').trim(); 
};


// Simple non-cryptographic hash function (djb2)
export const createScriptId = (pairs: SentencePair[]): string => {
  if (!pairs || pairs.length === 0) return '';
  
  // Clean the English text before hashing to ensure consistent IDs.
  // This prevents new stats entries from being created for scripts that are semantically identical
  // but have different formatting (e.g., after being downloaded and re-uploaded).
  const content = pairs
    .map(p => removeDigits(removeLeadingMetadata(p.english.trim())))
    .join('|');
  
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
  }
  return String(hash >>> 0); // Ensure positive 32-bit integer as a string
};

export const createScriptName = (pairs: SentencePair[], fileName?: string | null): string => {
  if (fileName) {
    return fileName;
  }
  if (pairs && pairs.length > 0) {
    // The name is based on the original, un-cleaned sentence for better user readability.
    const firstSentence = pairs[0].english;
    return firstSentence.length > 50 ? `${firstSentence.substring(0, 47)}...` : firstSentence;
  }
  return "Untitled Script";
};
