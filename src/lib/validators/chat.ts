// ============================================================================
// VietBridge AI V2 — Chat Request Validator
// ============================================================================

import { z } from "zod";

export const chatSchema = z.object({
  input: z.string().min(1).max(5000),
  task: z
    .enum(["translate", "reply", "risk", "learn"])
    .optional(),
  scene: z
    .enum([
      "general",
      "business",
      "staff",
      "couple",
      "restaurant",
      "rent",
      "hospital",
      "repair",
    ])
    .optional(),
  tone: z.number().min(0).max(100).optional().default(50),
  langDir: z.enum(["zh2vi", "vi2zh"]).optional().default("zh2vi"),
  conversationHistory: z.array(z.any()).optional().default([]),
});

export type ChatInput = z.infer<typeof chatSchema>;
