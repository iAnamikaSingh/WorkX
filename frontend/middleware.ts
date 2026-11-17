import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["login", "signup", "forgot-password", "api", "_next", "favicon.ico", "robots.txt", "sitemap.xml"]);
const USERNAME = /^[a-z0-9_]{3,20}$/;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const first = pathname.split("/").filter(Boolean)[0] || "";
  if (!first || PUBLIC_PATHS.has(first) || !USERNAME.test(first)) return NextResponse.next();

  const cookie = request.headers.get("cookie") || "";
  if (!cookie) return NextResponse.redirect(new URL("/login", request.url));

  const apiOrigin = process.env.API_SERVER_URL;
  if (!apiOrigin) return process.env.NODE_ENV === "production" ? NextResponse.json({ message: "Workspace authentication is not configured." }, { status: 503 }) : NextResponse.next();
  try {
    const response = await fetch(new URL("/api/auth/me", apiOrigin), {
      headers: { cookie, accept: "application/json" },
      cache: "no-store"
    });
    if (response.status === 401 || response.status === 403) return NextResponse.redirect(new URL("/login", request.url));
    if (!response.ok) return NextResponse.json({ message: "Workspace authentication is temporarily unavailable." }, { status: 503 });
    const payload = await response.json();
    if (!payload?.user?.username) return NextResponse.redirect(new URL("/login", request.url));
    if (payload.user.username !== first) {
      const url = request.nextUrl.clone();
      url.pathname = "/" + encodeURIComponent(payload.user.username) + pathname.slice(first.length + 1);
      return NextResponse.redirect(url);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-workx-user-id", String(payload.user.id));
    requestHeaders.set("x-workx-user-role", String(payload.user.role || "user"));
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
