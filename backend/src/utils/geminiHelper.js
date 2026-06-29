const { GoogleGenAI } = require("@google/genai");

// List of models in order of preference/capability
const FALLBACK_MODELS = [
  "gemini-flash-lite-latest",   // Most available, try first
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

// Per-model rate-limit cooldown tracking
// If a model returns 429, skip it for RATE_LIMIT_COOLDOWN_MS milliseconds
const modelRateLimitedUntil = {};
const RATE_LIMIT_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Generates content using the Google Gen AI SDK, automatically falling back
 * to alternative models if the primary model hits a rate limit or error.
 * 
 * Rate-limited models (429) are skipped for 3 minutes to avoid repeated failures.
 * 
 * @param {Object} options Options to pass to generateContent (contents, config, etc.)
 * @returns {Promise<Object>} The response from the successful model generation.
 */
async function generateContentWithFallback(options) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let lastError;
  const now = Date.now();

  for (const model of FALLBACK_MODELS) {
    // Skip models that are in their rate-limit cooldown window
    if (modelRateLimitedUntil[model] && now < modelRateLimitedUntil[model]) {
      const waitSec = Math.round((modelRateLimitedUntil[model] - now) / 1000);
      console.log(`[Gemini] Skipping ${model} — rate limited for another ${waitSec}s`);
      continue;
    }

    try {
      console.log(`[Gemini] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        ...options,
        model: model
      });
      console.log(`[Gemini] Success with model: ${model}`);
      // Clear any lingering cooldown on success
      delete modelRateLimitedUntil[model];
      return response;
    } catch (error) {
      const isRateLimit = error.message && (
        error.message.includes("429") ||
        error.message.includes("RESOURCE_EXHAUSTED") ||
        error.message.includes("quota")
      );

      if (isRateLimit) {
        // Parse the retryDelay from the error if available, else default to 3 min
        let retryDelay = RATE_LIMIT_COOLDOWN_MS;
        const retryMatch = error.message.match(/"retryDelay":\s*"(\d+)s"/);
        if (retryMatch) {
          retryDelay = (parseInt(retryMatch[1]) + 5) * 1000; // Add 5s buffer
        }
        modelRateLimitedUntil[model] = Date.now() + retryDelay;
        console.warn(`[Gemini] Rate limited on ${model}. Cooling down for ${Math.round(retryDelay / 1000)}s. Trying next model...`);
      } else {
        console.warn(`[Gemini] Failed with model ${model}: ${error.message}`);
      }
      lastError = error;
    }
  }

  // All models failed or rate-limited
  throw lastError || new Error("All Gemini models are currently unavailable.");
}

module.exports = {
  generateContentWithFallback
};
