import { api, apiGet, apiPatch, apiPost } from "../api";
import type { User } from "../types";

export const authService = {
  me: () => apiGet<{ user: User | null }>("/auth/me"),
  login: (username: string, password: string) => apiPost<{ user: User }>("/auth/login", { username, password }),
  signup: (input: { username: string; email: string; password: string }) => apiPost<{ user: User }>("/auth/signup", input),
  logout: () => apiPost<{ success: boolean }>("/auth/logout"),
  checkUsername: (username: string, signal?: AbortSignal) => apiGet<{ available: boolean; message: string }>(`/auth/check-username?username=${encodeURIComponent(username)}`, signal),
  updateUsername: (username: string) => apiPatch<{ user: User; message: string }>("/auth/username", { username }),
  deleteAccount: (password: string) => api("/auth/account", { method: "DELETE", body: JSON.stringify({ password }) })
};
