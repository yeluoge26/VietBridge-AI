// ============================================================================
// VietBridge AI — API Key Validators (Zod)
// ============================================================================

import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1, "请输入密钥名称").max(100),
});

export const updateApiKeySchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});
