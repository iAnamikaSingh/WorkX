import { notFound } from "next/navigation";

// A username root is intentionally not a second dashboard URL.
// The dashboard lives only at /[username]/dashboard.
export default function UsernameRootPage(): never {
  notFound();
}
