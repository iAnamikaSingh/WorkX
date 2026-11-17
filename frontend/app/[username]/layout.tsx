"use client";
import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingState } from "@/components/RouteError";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (user && user.username !== username) {
      const suffix = pathname.slice(("/" + username).length);
      router.replace("/" + encodeURIComponent(user.username) + suffix);
    }
  }, [status, user, username, pathname, router]);

  if (status !== "authenticated" || !user || user.username !== username) {
    return <LoadingState label="Verifying your secure workspace…" />;
  }
  return <>{children}</>;
}
