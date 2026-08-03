import { GoogleGenerativeAI } from '@google/generative-ai';

// gemini-3.1-flash-lite has the highest free-tier quota (15 RPM, 250K TPM).
// 2.0-flash and 2.0-flash-lite have 0 free-tier RPM as of July 2026.
const MODEL = 'gemini-3.1-flash-lite';

// Maximum number of automatic retries on a 429 response.
// Keep this low so the user isn't stuck waiting 30+ seconds on every attempt.
const MAX_RETRIES = 1;

// Cap on how long we will wait between retries (ms).
const MAX_RETRY_DELAY_MS = 10_000;

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your .env.local file.'
      );
    }
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

/** Extract the retry delay seconds from a Gemini 429 error body. */
function parseRetryDelay(message, fallbackMs = 5_000) {
  const match = message?.match(/"retryDelay":\s*"(\d+)s"/);
  if (match) return Math.min(parseInt(match[1], 10) * 1000, MAX_RETRY_DELAY_MS);
  return fallbackMs;
}

/**
 * Generate content using the Gemini API, with automatic retry on 429.
 * @param {string} prompt
 * @param {{ temperature?: number; maxOutputTokens?: number }} options
 * @returns {Promise<string>}
 */
export async function generateContent(
  prompt,
  { temperature = 0.7, maxOutputTokens = 2048 } = {}
) {
  const genai = getClient();
  const model = genai.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature, maxOutputTokens },
  });

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      const msg = err?.message ?? '';

      // Log the full error so the terminal shows exactly what Gemini returned.
      console.error('[gemini] Raw error:', {
        status: err?.status,
        statusText: err?.statusText,
        errorDetails: err?.errorDetails,
        message: msg,
      });

      // Surface auth errors immediately — retrying won't help.
      const isAuthError =
        msg.includes('401') ||
        msg.includes('403') ||
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED');
      if (isAuthError) {
        throw new Error(
          `Auth error from Gemini API — check your GEMINI_API_KEY. Raw: ${msg}`
        );
      }

      const isRateLimit =
        msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');

      if (!isRateLimit) throw err;

      if (attempt < MAX_RETRIES) {
        const delay = parseRetryDelay(msg);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // All retries exhausted — surface a friendly message.
      throw new Error(
        'The AI service is currently rate-limited. Please wait a moment and try again.'
      );
    }
  }

  throw lastErr;
}

