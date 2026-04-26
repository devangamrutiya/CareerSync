"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiClient = getGeminiClient;
const genai_1 = require("@google/genai");
let _instance = null;
function getGeminiClient() {
    if (!_instance) {
        _instance = new genai_1.GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || '',
        });
    }
    return _instance;
}
//# sourceMappingURL=gemini-resume.client.js.map