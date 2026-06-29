require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-2.0-flash'
  ];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const model of models) {
    console.log(`\n--- Testing ${model} ---`);
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Hello, are you functional?',
      });
      console.log(`SUCCESS with ${model}! Response:`, response.text);
    } catch (error) {
      console.error(`FAILED with ${model}:`, error.message);
    }
  }
}

test();
