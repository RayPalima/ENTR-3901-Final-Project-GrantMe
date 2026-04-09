import { createOpenAI } from "@ai-sdk/openai";

let _openrouter: ReturnType<typeof createOpenAI> | null = null;

function getOpenRouter() {
  if (!_openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Add it to .env.local"
      );
    }
    _openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
  }
  return _openrouter;
}

export function getModel() {
  return getOpenRouter()("google/gemini-2.0-flash-001");
}
