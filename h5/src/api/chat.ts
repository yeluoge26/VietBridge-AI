import { apiStream, apiPost } from "./client";

export interface ChatRequest {
  input: string;
  task: string;
  scene: string;
  tone: number;
  langDir: string;
  conversationHistory?: unknown[];
  conversationId?: string | null;
  stream?: boolean;
}

export function chatStream(body: ChatRequest): Promise<Response> {
  return apiStream("/api/chat", { ...body, stream: true });
}

export function chatPost<T>(body: ChatRequest): Promise<T> {
  return apiPost<T>("/api/chat", body);
}
