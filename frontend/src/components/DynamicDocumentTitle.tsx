"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "WorkX — Learning Tracker & Productivity Workspace",
  "/login": "Sign In", "/signup": "Create Account", "/forgot-password": "Reset Password",
  "/dashboard": "Dashboard", "/productivity": "Productivity Hub", "/logs": "Learning Logs",
  "/logs/new": "New Learning Log", "/account": "Account Settings", "/admin": "Admin Dashboard"
};

function titleForPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const route = parts.length > 1 ? "/" + parts.slice(1).join("/") : parts.length === 1 ? "/" + parts[0] : "/";
  if (TITLES[route]) return TITLES[route];
  if (/^\\/logs\\/[^/]+\\/edit$/.test(route)) return "Edit Learning Log";
  if (/^\\/logs\\/[^/]+$/.test(route)) return "Learning Log";
  return parts.length > 1 ? "WorkX Workspace" : "Page Not Found";
}

export default function DynamicDocumentTitle() {
  const pathname = usePathname();
  useEffect(() => {
    const pageTitle = titleForPath(pathname);
    document.title = pageTitle === "WorkX — Learning Tracker & Productivity Workspace" ? pageTitle : pageTitle + " | WorkX";
  }, [pathname]);
  return null;
}
