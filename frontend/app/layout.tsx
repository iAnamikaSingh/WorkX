import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
export const metadata: Metadata = { title: "WorkX — Make progress visible", description: "A calmer, clearer way to track what you learn and build a consistent learning habit.", applicationName: "WorkX" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }