"use client";
import { createContext, useContext } from "react";
import type { User } from "./types";
export type WorkspaceAuthState = { user: User | null; loading: boolean; refreshUser: () => Promise<User | null> };
export const WorkspaceAuthContext = createContext<WorkspaceAuthState | null>(null);
export function useWorkspaceAuth() {
  const value = useContext(WorkspaceAuthContext);
  if (!value) throw new Error("useWorkspaceAuth must be used inside a workspace layout.");
  return value;
}
