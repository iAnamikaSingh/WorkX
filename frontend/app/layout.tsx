import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "WorkX — Make progress visible", description: "A calmer, clearer way to track what you learn and build a consistent learning habit.", applicationName: "WorkX" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }