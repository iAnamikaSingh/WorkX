import type { NextConfig } from "next";
const apiOrigin = process.env.API_SERVER_URL || "http://localhost:8000";
const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() { return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }]; },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
    ] }];
  }
};
export default nextConfig;
