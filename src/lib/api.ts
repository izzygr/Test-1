"use client";

const TOKEN_KEY = "hatunateinu-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "שגיאת שרת" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get<T>(url: string): Promise<T> {
    return fetch(url, { headers: authHeaders() }).then((r) => handleResponse<T>(r));
  },
  post<T>(url: string, data?: unknown): Promise<T> {
    return fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then((r) =>
      handleResponse<T>(r)
    );
  },
  put<T>(url: string, data?: unknown): Promise<T> {
    return fetch(url, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then((r) =>
      handleResponse<T>(r)
    );
  },
  delete<T>(url: string, data?: unknown): Promise<T> {
    return fetch(url, { method: "DELETE", headers: authHeaders(), body: JSON.stringify(data) }).then((r) =>
      handleResponse<T>(r)
    );
  },
};
