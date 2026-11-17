import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/login", "/signup", "/forgot-password", "/*/dashboard", "/*/productivity", "/*/logs", "/*/account", "/*/admin"] }],
    sitemap: "https://workx-ianamikasingh.vercel.app/sitemap.xml",
    host: "https://workx-ianamikasingh.vercel.app"
  };
}
