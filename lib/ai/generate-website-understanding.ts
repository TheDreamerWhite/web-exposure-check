import "server-only";

import { buildWebsiteUnderstandingPrompt } from "./build-website-understanding-prompt";
import { parseAiWebsiteUnderstandingJson } from "./parse-ai-json";
import type { ReportScanResult } from "@/lib/report/types";
import type { AiWebsiteUnderstanding } from "./types";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const AI_TIMEOUT_MS = 15000;

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type AiWebsiteUnderstandingInput = {
  scanResult: ReportScanResult;
};

export function isWebsiteUnderstandingEnabled() {
  return (
    process.env.ENABLE_AI_WEBSITE_UNDERSTANDING === "true" &&
    Boolean(process.env.OPENAI_API_KEY)
  );
}

export async function generateWebsiteUnderstanding(
  input: AiWebsiteUnderstandingInput
): Promise<AiWebsiteUnderstanding | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!isWebsiteUnderstandingEnabled() || !apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an evidence-bound website trust analyst. Return JSON only and never claim evidence that was not provided.",
        },
        {
          role: "user",
          content: buildWebsiteUnderstandingPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as OpenAiChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI response did not include JSON content.");
  }

  return parseAiWebsiteUnderstandingJson(content, model);
}
