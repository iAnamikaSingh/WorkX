export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, payload?: { code?: string; details?: unknown }) {
    super(message); this.name = "ApiError"; this.status = status; this.code = payload?.code; this.details = payload?.details;
  }
}
type ApiOptions = RequestInit & { skipAuthRedirect?: boolean };
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuthRedirect = false, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  if (requestOptions.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const response = await fetch(`/api${path.startsWith("/") ? path : `/${path}`}`, { ...requestOptions, headers, credentials: "same-origin", cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new ApiError(typeof payload?.message === "string" ? payload.message : "Something went wrong. Please try again.", response.status, payload);
    if (response.status === 401 && !skipAuthRedirect && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("workx:unauthorized"));
    throw error;
  }
  return payload as T;
}
export const apiGet = <T>(path: string, signal?: AbortSignal) => api<T>(path, { method: "GET", signal });
export const apiPost = <T>(path: string, body?: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const apiPut = <T>(path: string, body: unknown) => api<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) => api<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = <T>(path: string, body?: unknown) => api<T>(path, { method: "DELETE", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
