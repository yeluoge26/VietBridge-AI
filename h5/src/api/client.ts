const API_BASE = import.meta.env.VITE_API_BASE || "";

function getGuestId(): string {
  let id = localStorage.getItem("vb_guest_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vb_guest_id", id);
  }
  return id;
}

function getAuthToken(): string | null {
  return localStorage.getItem("vb_auth_token");
}

export function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const token = getAuthToken();
  if (token) {
    h["Authorization"] = `Bearer ${token}`;
  } else {
    h["X-Guest-Id"] = getGuestId();
  }
  return h;
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: buildHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `HTTP ${res.status}`, body);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error || `HTTP ${res.status}`, data);
  }
  return res.json();
}

export async function apiStream(path: string, body: unknown): Promise<Response> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error || `HTTP ${res.status}`, data);
  }
  return res;
}

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, message: string, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
