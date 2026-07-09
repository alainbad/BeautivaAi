import type { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { AppError } from "./response";
import { CLAUDE_MODEL, getAnthropicClient } from "./anthropic";

/** Strip ```json fences models sometimes add despite instructions not to. */
function extractJson(text: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  return (fenced ? fenced[1] : text).trim();
}

/** Call Claude and parse+validate its reply as JSON against a zod schema. */
export async function askClaudeForJson<T>(opts: {
  system: string;
  messages: Array<Anthropic.MessageParam>;
  schema: z.ZodType<T>;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: opts.messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new AppError("The AI did not return a text response.", 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(textBlock.text));
  } catch {
    throw new AppError("The AI response was not valid JSON.", 502);
  }

  const result = opts.schema.safeParse(parsed);
  if (!result.success) {
    console.error("Claude JSON schema mismatch", result.error.flatten());
    throw new AppError("The AI response did not match the expected format.", 502);
  }
  return result.data;
}
