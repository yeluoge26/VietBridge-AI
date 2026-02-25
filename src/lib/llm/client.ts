// ============================================================================
// VietBridge AI V2 - LLM Client Factory
// OpenAI SDK factory with provider-based caching
// ============================================================================

import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

type Provider = "openai" | "qwen";

interface ProviderConfig {
  apiKeyEnv: string;
  baseUrlEnv?: string;
  defaultBaseUrl?: string;
}

const PROVIDER_CONFIG: Record<Provider, ProviderConfig> = {
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
  },
  qwen: {
    apiKeyEnv: "QWEN_API_KEY",
    baseUrlEnv: "QWEN_API_BASE_URL",
    defaultBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
};

// ---------------------------------------------------------------------------
// Client cache
// ---------------------------------------------------------------------------

const clients: Record<string, OpenAI> = {};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Get or create an OpenAI-compatible client for the specified provider.
 * Clients are cached by provider name to avoid recreating them on every request.
 *
 * @param provider - "openai" for OpenAI models, "qwen" for Alibaba Qwen models
 * @returns An OpenAI SDK client configured for the specified provider
 * @throws Error if the required API key environment variable is not set
 */
export function getClient(provider: Provider): OpenAI {
  // Return cached client if available
  if (clients[provider]) {
    return clients[provider];
  }

  const config = PROVIDER_CONFIG[provider];
  const apiKey = process.env[config.apiKeyEnv];

  if (!apiKey) {
    throw new Error(
      `缺少 ${config.apiKeyEnv} 环境变量。请在 .env.local 中配置。`
    );
  }

  const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey,
  };

  // Set base URL for non-OpenAI providers
  if (config.baseUrlEnv || config.defaultBaseUrl) {
    const baseUrl = config.baseUrlEnv
      ? process.env[config.baseUrlEnv] || config.defaultBaseUrl
      : config.defaultBaseUrl;

    if (baseUrl) {
      clientOptions.baseURL = baseUrl;
    }
  }

  const client = new OpenAI(clientOptions);
  clients[provider] = client;

  return client;
}

/**
 * Determine which provider to use for a given model name.
 */
export function getProviderForModel(
  modelName: string
): Provider {
  if (modelName.startsWith("qwen")) {
    return "qwen";
  }
  // Default to OpenAI for GPT and Claude models (when using OpenAI-compatible API)
  return "openai";
}

/**
 * Clear the client cache. Useful for testing or when API keys change.
 */
export function clearClientCache(): void {
  for (const key of Object.keys(clients)) {
    delete clients[key];
  }
}
