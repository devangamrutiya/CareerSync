import { GoogleGenAI } from '@google/genai';

let _instance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_instance) {
    _instance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
  }
  return _instance;
}
