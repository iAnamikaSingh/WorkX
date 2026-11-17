"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, ArrowLeft, ChevronLeft, ChevronRight, Search, ShieldCheck, Shield, Users, BookOpen, RefreshCw, UserRoundCheck, UserRoundX } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { adminService, type AdminUser } from "@/lib/services/admin";
import { ErrorMessage, LoadingState } from "@/components/RouteError";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

type Overview = { users: number; logs: number; admins: number };
const PAGE_SIZE = 25;

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboardPage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user, status } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "admin") router.replace(`/${encodeURIComponent(user.username)}/dashboard`);
  }, [status, user, router]);

  const load = useCallback(async (requestedPage = page) => {
    setLoading(true);
    setError("");
    try {
      const [summary, result] = await Promise.all([
        adminService.overview(),
        adminService.users(requestedPage, PAGE_SIZE)
      ]);
      setOverview(summary.overview);
      setUsers(result.users);
      setPage(result.pagination.page);
      setPages(Math.max(1, result.pagination.pages));
      setTotal(result.pagination.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load administrator data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (status === "authenticated" && user?.role === "admin") void load(1);
  }, [status, user?.role, load]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(item => item.username.toLowerCase().includes(term) || item.email.toLowerCase().includes(term));
  }, [users, search]);

  async function changeRole(target: AdminUser) {
    const nextRole = target.role === "admin" ? "user" : "admin";
    if (target.id === user?.id && nextRole === "user") {
      setError("You cannot remove your own administrator access from this screen.");
      return;
    }
    const confirmed = window.confirm(`${nextRole === "admin" ? "Promote" : "Demote"} @${target.username} ${nextRole === "admin" ? "to administrator" : "to a regular user"}?`);
    if (!confirmed) return;
    setPendingId(target.id);
    setError("");
    setNotice("");
    try {
      const result = await adminService.updateRole(target.id, nextRole);
      setUsers(current => current.map(item => item.id === target.id ? { ...item, role: result.user.role ?? nextRole } : item));
      const summary = await adminService.overview();
      setOverview(summary.overview);
      setNotice(result.message || `@${target.username} is now ${nextRole === "admin" ? "an administrator" : "a regular user"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update this user's role.");
    } finally {
      setPendingId(null);
    }
  }

  if (status === "loading" || !user || user.role !== "admin") {
    return <LoadingState label="Verifying administrator access…"/>;
  }

  return <div className="app-layout">
    <WorkspaceSidebar active="admin"/>
    <main className="main-area admin-main">
      <div className="admin-heading">
        <div>
          <div className="eyebrow"><ShieldCheck size={13}/> WORKX / ADMINISTRATION</div>
          <h1>Admin <span className="accent">console</span></h1>
          <p>Manage platform access and monitor the WorkX workspace.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => void load(page)} disabled={loading}>
          <RefreshCw size={15} className={loading ? "admin-spin" : ""}/> Refresh data
        </button>
      </div>

      {error && <ErrorMessage error={error}/>}
      {notice && <div className="notice admin-success" role="status">{notice}</div>}

      <section className="admin-stat-grid" aria-label="Platform overview">
        <article className="admin-stat-card"><span><Users size={15}/> REGISTERED USERS</span><strong>{overview ? overview.users.toLocaleString() : "—"}</strong><small>All WorkX accounts</small></article>
        <article className="admin-stat-card"><span><BookOpen size={15}/> LEARNING LOGS</span><strong>{overview ? overview.logs.toLocaleString() : "—"}</strong><small>Logs across all users</small></article>
        <article className="admin-stat-card"><span><Shield size={15}/> ADMINISTRATORS</span><strong>{overview ? overview.admins.toLocaleString() : "—"}</strong><small>Accounts with elevated access</small></article>
      </section>

      <section className="admin-users-section">
        <div className="admin-section-heading">
          <div><div className="eyebrow"><Activity size={13}/> ACCESS CONTROL</div><h2>User management</h2><p>Review registered accounts and assign administrator privileges.</p></div>
          <span className="admin-total">{total.toLocaleString()} USERS</span>
        </div>

        <div className="admin-toolbar">
          <label className="admin-search"><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search this page by username or email…" aria-label="Search users on this page"/></label>
          <span className="admin-page-label">Page {page} of {pages}</span>
        </div>

        {loading ? <div className="admin-table-loading" aria-live="polite">Loading account directory…</div> : filteredUsers.length === 0 ? (
          <div className="empty admin-empty">{search ? "No users on this page match your search." : "No registered users were found."}</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ACCOUNT</th><th>ROLE</th><th>JOINED</th><th className="admin-action-heading">ACTION</th></tr></thead>
              <tbody>{filteredUsers.map(account => <tr key={account.id}>
                <td><div className="admin-user-name">{account.username}{account.id === user.id && <span className="admin-you">YOU</span>}</div><div className="admin-user-email">{account.email}</div></td>
                <td><span className={`admin-role ${account.role === "admin" ? "is-admin" : ""}`}>{account.role === "admin" ? <ShieldCheck size={13}/> : <Users size={13}/>} {account.role === "admin" ? "Admin" : "User"}</span></td>
                <td className="admin-date">{dateLabel(account.createdAt)}</td>
                <td className="admin-action-cell"><button className={`btn admin-role-button ${account.role === "admin" ? "admin-demote" : "admin-promote"}`} onClick={() => void changeRole(account)} disabled={pendingId === account.id || account.id === user.id}>
                  {pendingId === account.id ? "Updating…" : account.role === "admin" ? <><UserRoundX size={14}/> Demote</> : <><UserRoundCheck size={14}/> Make admin</>}
                </button></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div><button className="btn btn-ghost" onClick={() => void load(page - 1)} disabled={loading || page <= 1}><ChevronLeft size={15}/> Previous</button><button className="btn btn-ghost" onClick={() => void load(page + 1)} disabled={loading || page >= pages}>Next <ChevronRight size={15}/></button></div>
        </div>
      </section>

      <div className="admin-footnote"><ShieldCheck size={15}/> Administrative actions are enforced by the WorkX API. Your own administrator access cannot be removed from this screen.</div>
    </main>
  </div>;
}
