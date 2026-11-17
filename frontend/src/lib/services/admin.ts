import { apiGet, apiPatch } from "../api";
import type { User } from "../types";

export type AdminUser = User & { createdAt: string };
export const adminService = {
  overview: () => apiGet<{ overview: { users: number; logs: number; admins: number } }>("/admin/overview"),
  users: (page = 1, limit = 25) => apiGet<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/admin/users?page=${page}&limit=${limit}`),
  updateRole: (userId: string, role: "admin" | "user") => apiPatch<{ user: User; message: string }>(`/admin/users/${encodeURIComponent(userId)}/role`, { role })
};
