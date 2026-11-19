export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export async function apiFetch(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
  tokenKey?: string
) {
  const token =
    typeof window !== "undefined" && tokenKey
      ? localStorage.getItem(tokenKey)
      : null;
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let errorData = null;
    try {
      errorData = await res.json();
    } catch {
      // Ignore JSON parse failures
    }
    const error: ApiError = new Error(`API Error: ${res.status}`);
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  return res.json();
}
