
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Safely access process.env.API_KEY
let apiKey: string | undefined = undefined;
try {
  // Check if process and process.env are defined and API_KEY is a string
  if (typeof process !== 'undefined' && 
      process.env && 
      typeof process.env.API_KEY === 'string' && 
      process.env.API_KEY.trim() !== '') {
    apiKey = process.env.API_KEY;
  }
} catch (e) {
  // In some environments, accessing process or process.env might throw an error
  console.warn("Error accessing process.env.API_KEY. This might be due to security restrictions or an undefined 'process' object in your environment.", e);
}

if (!apiKey) {
  console.warn("API_KEY could not be retrieved from the environment (process.env.API_KEY is missing or empty). Gemini API features will be disabled.");
}

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } catch (initError) {
    console.error("Error initializing GoogleGenAI client:", initError);
    ai = null; // Ensure ai is null if initialization fails
    // The !ai check in translateSentencesToRussian will throw a user-facing error.
  }
} else {
  // This message is for the console; App.tsx will show a UI error.
  console.error("Gemini API key is missing or inaccessible; AI client not initialized.");
}

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const translateSentencesToRussian = async (englishSentences: string[]): Promise<string[]> => {
  if (!ai) {
    // This error will be caught by App.tsx and shown to the user.
    throw new Error("Gemini AI client is not initialized. Please ensure the API_KEY is correctly configured in the application's environment.");
  }
  if (englishSentences.length === 0) {
    return [];
  }

  // New robust prompt asking for JSON output
  const prompt = `Translate the following English sentences into Russian.
Respond with a single JSON array of strings. Each string in the array should be the Russian translation.
The order of translations must match the order of the input sentences.
The JSON array must contain exactly ${englishSentences.length} strings.

Example Request:
["Hello, how are you?", "This is a test."]

Example Response:
["Привет, как дела?", "Это тест."]

English Sentences:
${JSON.stringify(englishSentences)}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text.trim();
    // The response might be wrapped in markdown ```json ... ```, so we need to extract it.
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);

      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
        // The response is a valid array of strings.
        if (parsedData.length !== englishSentences.length) {
            console.error(`Gemini API returned a JSON array with the wrong number of items. Expected ${englishSentences.length}, got ${parsedData.length}.`, parsedData);
            throw new Error(`The AI returned an incorrect number of translations. Expected ${englishSentences.length}, but received ${parsedData.length}.`);
        }
        return parsedData;
      } else {
        console.error("Gemini API returned valid JSON, but it was not an array of strings:", parsedData);
        throw new Error("The AI returned data in an unexpected format. Expected an array of translated strings.");
      }
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini API. Raw text:", jsonStr, "Error:", e);
      throw new Error("The AI returned a response that was not valid JSON. Please try again.");
    }

  } catch (error) {
    console.error("Error translating sentences with Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw with a more user-friendly message, but log the original.
        throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while translating with Gemini API.");
  }
};
