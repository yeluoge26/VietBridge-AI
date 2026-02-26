// ============================================================================
// VietBridge AI — LLM Call with Timeout + Fallback
// Wraps OpenAI-compatible API calls with configurable timeout and
// automatic fallback to a secondary model on failure/timeout.
// ============================================================================

import { getClient, getProviderForModel } from "./client";
import { estimateTokens } from "../token-estimator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMCallResult {
  output: string;
  modelUsed: string;
  provider: string;
  tokensPrompt: number;
  tokensCompletion: number;
  usedFallback: boolean;
}

export interface LLMCallParams {
  messages: Array<{ role: string; content: string }>;
  primaryModel: string;
  fallbackModel?: string;
  maxLatency?: number; // ms, default 15000
  temperature?: number;
  maxTokens?: number;
}

export interface LLMStreamResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream: AsyncIterable<any>;
  modelUsed: string;
  provider: string;
  usedFallback: boolean;
}

// ---------------------------------------------------------------------------
// Timeout helper
// ---------------------------------------------------------------------------

const TIMEOUT_SYMBOL = Symbol("timeout");

function timeoutPromise(ms: number): Promise<typeof TIMEOUT_SYMBOL> {
  return new Promise((resolve) => setTimeout(() => resolve(TIMEOUT_SYMBOL), ms));
}

// ---------------------------------------------------------------------------
// Non-streaming LLM call
// ---------------------------------------------------------------------------

export async function callLLM(params: LLMCallParams): Promise<LLMCallResult> {
  const {
    messages,
    primaryModel,
    fallbackModel,
    maxLatency = 15000,
    temperature = 0.7,
    maxTokens = 2000,
  } = params;

  // Try primary model
  try {
    const result = await callWithTimeout(
      messages,
      primaryModel,
      temperature,
      maxTokens,
      maxLatency
    );
    return { ...result, usedFallback: false };
  } catch (primaryError) {
    // If no fallback, throw the original error
    if (!fallbackModel) throw primaryError;

    console.warn(
      `[LLM Fallback] Primary model ${primaryModel} failed: ${primaryError instanceof Error ? primaryError.message : "unknown"}. Trying fallback: ${fallbackModel}`
    );

    // Try fallback model (with generous timeout)
    try {
      const result = await callWithTimeout(
        messages,
        fallbackModel,
        temperature,
        maxTokens,
        30000
      );
      return { ...result, usedFallback: true };
    } catch (fallbackError) {
      // Both failed — throw the original error
      console.error(
        `[LLM Fallback] Fallback model ${fallbackModel} also failed:`,
        fallbackError
      );
      throw primaryError;
    }
  }
}

async function callWithTimeout(
  messages: Array<{ role: string; content: string }>,
  modelName: string,
  temperature: number,
  maxTokens: number,
  timeoutMs: number
): Promise<Omit<LLMCallResult, "usedFallback">> {
  const provider = getProviderForModel(modelName);
  const client = getClient(provider);

  const apiCall = client.chat.completions.create({
    model: modelName,
    messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
    temperature,
    max_tokens: maxTokens,
  });

  const result = await Promise.race([apiCall, timeoutPromise(timeoutMs)]);

  if (result === TIMEOUT_SYMBOL) {
    throw new Error(`Model ${modelName} timed out after ${timeoutMs}ms`);
  }

  const completion = result;
  const output = completion.choices[0]?.message?.content || "";
  const tokensPrompt =
    completion.usage?.prompt_tokens ||
    estimateTokens(messages.map((m) => m.content).join(""));
  const tokensCompletion =
    completion.usage?.completion_tokens || estimateTokens(output);

  return {
    output,
    modelUsed: modelName,
    provider,
    tokensPrompt,
    tokensCompletion,
  };
}

// ---------------------------------------------------------------------------
// Streaming LLM call
// ---------------------------------------------------------------------------

export async function callLLMStream(
  params: LLMCallParams
): Promise<LLMStreamResult> {
  const {
    messages,
    primaryModel,
    fallbackModel,
    maxLatency = 15000,
    temperature = 0.7,
    maxTokens = 2000,
  } = params;

  // Try primary model
  try {
    const result = await createStreamWithTimeout(
      messages,
      primaryModel,
      temperature,
      maxTokens,
      maxLatency
    );
    return { ...result, usedFallback: false };
  } catch (primaryError) {
    if (!fallbackModel) throw primaryError;

    console.warn(
      `[LLM Stream Fallback] Primary model ${primaryModel} failed. Trying fallback: ${fallbackModel}`
    );

    try {
      const result = await createStreamWithTimeout(
        messages,
        fallbackModel,
        temperature,
        maxTokens,
        30000
      );
      return { ...result, usedFallback: true };
    } catch (fallbackError) {
      console.error(
        `[LLM Stream Fallback] Fallback also failed:`,
        fallbackError
      );
      throw primaryError;
    }
  }
}

async function createStreamWithTimeout(
  messages: Array<{ role: string; content: string }>,
  modelName: string,
  temperature: number,
  maxTokens: number,
  timeoutMs: number
): Promise<Omit<LLMStreamResult, "usedFallback">> {
  const provider = getProviderForModel(modelName);
  const client = getClient(provider);

  const streamCall = client.chat.completions.create({
    model: modelName,
    messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  const result = await Promise.race([streamCall, timeoutPromise(timeoutMs)]);

  if (result === TIMEOUT_SYMBOL) {
    throw new Error(`Stream for ${modelName} timed out after ${timeoutMs}ms`);
  }

  return {
    stream: result,
    modelUsed: modelName,
    provider,
  };
}
