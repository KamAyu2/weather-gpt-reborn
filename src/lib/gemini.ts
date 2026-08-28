/**
 * Client-side Gemini API helper.
 * Calls the Google Gemini API directly from the browser.
 * The API key is stored in localStorage.
 */

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

export function getGeminiApiKey(): string {
  return localStorage.getItem("gemini_api_key") || "";
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem("gemini_api_key", key);
}

function buildSystemPrompt(language: string): string {
  const LANGUAGE_MAP: Record<string, string> = {
    en: "English", hi: "Hindi", ta: "Tamil", bn: "Bengali", te: "Telugu",
    mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
  };
  const lang = LANGUAGE_MAP[language] || "English";

  return `You are Weather GPT — an intelligent, versatile AI assistant. You answer anything accurately and thoroughly.

WEATHER EXPERTISE:
- Real-time weather for ANY location worldwide
- 7-day forecasts, agriculture advisories, disaster alerts
- Climate patterns, monsoons, El Niño, weather science
- NWP models (GFS, ECMWF, ICON)

GENERAL KNOWLEDGE:
- Science, history, geography, math, technology
- Cooking, travel, sports, entertainment
- Health, education, business, culture, space
- Be thorough and detailed. Give examples and practical tips.

STYLE:
- Warm, friendly, conversational
- Use emojis naturally
- Format with markdown: bold, bullets, numbered lists
- For Indian users, prioritize Indian context

LANGUAGE: Respond entirely in ${lang}. Keep technical terms in English.`
}

/**
 * Call Gemini API directly from the client.
 * Returns the response text, or null on failure.
 */
export async function callGeminiFromClient(
  userMessage: string,
  language: string = "en",
  apiKeyOverride?: string
): Promise<string | null> {
  const apiKey = apiKeyOverride || getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: buildSystemPrompt(language) }] },
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 50,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown");
      console.error("Gemini client API error:", response.status, errorBody);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini client error:", error);
    return null;
  }
}
