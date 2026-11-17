import { api, apiDelete, apiGet, apiPatch, apiPost } from "../api";
import type { LearningLog, Topic } from "../types";

export const logsService = {
  list: (signal?: AbortSignal) => apiGet<{ logs: LearningLog[] }>("/logs", signal),
  create: (input: { date: string; topics: Topic[] }) => apiPost<{ log: LearningLog }>("/logs", input),
  update: (id: string, input: { date: string; topics: Topic[] }) => apiPatch<{ log: LearningLog }>(`/logs/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiDelete<{ success: boolean }>(`/logs/${encodeURIComponent(id)}`)
};
