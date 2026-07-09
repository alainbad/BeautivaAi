import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "./env";

let client: Anthropic | undefined;

export function getAnthropicClient() {
  if (!client) {
    client = new Anthropic({ apiKey: serverEnv.anthropicApiKey });
  }
  return client;
}

/** Model used for both the vision skin analysis and the beauty chat. */
export const CLAUDE_MODEL = "claude-sonnet-5";
