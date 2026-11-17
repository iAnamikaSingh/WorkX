import { api, apiGet, apiPatch, apiPost } from "../api";
import type { User } from "../types";

export const authService = {
  me: () => apiGet<{ user: User | null }>("/auth/me"),
  login: (username: string, password: string) => apiPost<{ user: User }>("/auth/login", { username, password }),
  signup: (input: { username: string; email: string; password: string }) => apiPost<{ user: User }>("/auth/signup", input),
  logout: () => apiPost<{ success: boolean }>("/auth/logout"),
  checkUsername: (username: string, signal?: AbortSignal) => apiGet<{ available: boolean; message: string }>(`/auth/check-username?username=${encodeURIComponent(username)}`, signal),
  updateUsername: (username: string) => apiPatch<{ user: User; message: string }>("/auth/username", { username }),
  deleteAccount: (password: string) => api("/auth/account", { method: "DELETE", body: JSON.stringify({ password }) }),
  sendSignupOtp: (email: string) => apiPost<{ success: boolean; message: string }>("/auth/send-otp", { email }),
  verifySignupOtp: (email: string, otp: string) => apiPost<{ success: boolean; message: string }>("/auth/verify-otp", { email, otp }),
  requestPasswordReset: (email: string) => apiPost<{ message: string }>("/auth/forgot-password", { email }),
  verifyPasswordReset: (email: string, otp: string) => apiPost<{ message: string }>("/auth/verify-password-reset", { email, otp }),
  resetPassword: (email: string, password: string) => apiPost<{ message: string }>("/auth/reset-password", { email, password })
};
