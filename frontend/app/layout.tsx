import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import DynamicDocumentTitle from "@/components/DynamicDocumentTitle";

const siteUrl = "https://workx-ianamikasingh.vercel.app";
const description = "WorkX is a personal learning tracker and productivity workspace. Record learning sessions, organize topics, set goals, manage tasks, and build consistent study habits.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "WorkX — Learning Tracker & Productivity Workspace", template: "%s | WorkX" },
  description,
  applicationName: "WorkX",
  category: "education",
  keywords: ["WorkX", "learning tracker", "study tracker", "learning log", "study time tracker", "productivity workspace", "learning goals", "study planner", "learning progress", "personal productivity"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "WorkX", title: "WorkX — Learning Tracker & Productivity Workspace", description, locale: "en_IN" },
  twitter: { card: "summary", title: "WorkX — Learning Tracker & Productivity Workspace", description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: "/icon.svg" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07110b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><DynamicDocumentTitle />{children}</Providers></body></html>;
}
