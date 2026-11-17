import { apiGet, apiPut } from "../api";

export type ProductivityItem = { id: string; title?: string; [key: string]: unknown };
export type ProductivityData = {
  goals: ProductivityItem[];
  tasks: ProductivityItem[];
  notes: ProductivityItem[];
  bookmarks: ProductivityItem[];
  flashcards: ProductivityItem[];
};
export const emptyProductivityData: ProductivityData = { goals: [], tasks: [], notes: [], bookmarks: [], flashcards: [] };

export const productivityService = {
  get: (signal?: AbortSignal) => apiGet<{ workspace: ProductivityData }>("/workspace", signal),
  save: (data: ProductivityData) => apiPut<{ workspace: ProductivityData }>("/workspace", data)
};
