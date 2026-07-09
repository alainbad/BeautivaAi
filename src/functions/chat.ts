import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/server/lib/auth";
import { CLAUDE_MODEL, getAnthropicClient } from "@/server/lib/anthropic";
import { AppError, toApiResponse } from "@/server/lib/response";
import { COSMETIC_DISCLAIMER } from "@/server/lib/skincare-schemas";

const CHAT_SYSTEM_PROMPT = `You are the BeautyAI Beauty Assistant, a friendly cosmetic skincare chat assistant inside the BeautyAI app.

Answer questions about skincare routines, ingredients, product pairings, and general beauty guidance.
Keep replies concise (2-5 sentences) and conversational, suitable for a mobile chat bubble.
Never diagnose medical conditions and never claim certainty about a user's skin from text alone.
If a question describes a medical concern (pain, infection, unusual growths, severe reactions), recommend seeing a dermatologist or doctor instead of guessing.
If relevant, you may mention: "${COSMETIC_DISCLAIMER}"`;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      message: z.string().min(1).max(2000),
      history: z.array(chatMessageSchema).max(20).default([]),
    }),
  )
  .handler(async ({ data }) =>
    toApiResponse(async () => {
      const { supabase, user } = await requireUser();

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!subscription || subscription.plan !== "premium" || subscription.status !== "active") {
        throw new AppError(
          "AI Beauty Chat is a Premium feature. Upgrade to keep chatting with your beauty coach.",
          402,
        );
      }

      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: CHAT_SYSTEM_PROMPT,
        messages: [
          ...data.history.map((m) => ({ role: m.role, content: m.text }) as const),
          { role: "user" as const, content: data.message },
        ],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new AppError("The AI did not return a response.", 502);
      }
      return { reply: textBlock.text };
    }),
  );
