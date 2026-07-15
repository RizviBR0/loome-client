"use client";

import Link from "next/link";
import {
  BarChart3,
  Check,
  Flag,
  Image as ImageIcon,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteDesign, fetchDesigns } from "@/lib/api";
import { useLoomeSession } from "@/lib/use-loome-session";
import type { Design } from "@/lib/types";

type Report = {
  id: string;
  designSlug: string;
  reason: string;
  reporter: string;
  createdAt: string;
};
type Stats = {
  activeDesigners: number;
  publishedDesigns: number;
  reportsToReview: number;
  uploads: number[];
  views: number[];
  likes: number[];
  categoryMix: Record<string, number>;
};
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Designer";
  suspended?: boolean;
  createdAt?: string;
};

const emptyStats: Stats = {
  activeDesigners: 0,
  publishedDesigns: 0,
  reportsToReview: 0,
  uploads: [],
  views: [],
  likes: [],
  categoryMix: {},
};

export default function AdminPage() {
  const { data: session, isPending } = useLoomeSession();
  const [range, setRange] = useState("30 days");
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [recent, setRecent] = useState<Design[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }).then(
          (response) => {
            if (!response.ok) throw new Error("Admin access required");
            return response.json();
          },
        ),
        fetchDesigns(),
        fetch("/api/reports", { credentials: "include" }).then((response) =>
          response.ok ? response.json() : [],
        ),
        fetch("/api/admin/users", { credentials: "include" }).then(
          (response) => (response.ok ? response.json() : []),
        ),
      ])
        .then(([nextStats, designs, nextReports, nextUsers]) => {
          setStats(nextStats);
          setRecent(designs.slice(0, 5));
          setReports(nextReports);
          setUsers(nextUsers);
          setHasAccess(true);
        })
        .catch(() => setHasAccess(false));
    }
  }, [session]);
  if (isPending || (session && hasAccess === null))
    return (
      <main className="loome-page-shell">
        <div className="loome-section pt-40 pb-24">
          <div className="h-40 animate-pulse rounded-[24px] bg-white/70" />
        </div>
      </main>
    );
  if (!session)
    return (
      <main className="loome-page-shell">
        <div className="mx-auto max-w-xl px-5 pt-40 pb-24 text-center">
          <p className="loome-kicker">Admin console</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            A private view of the platform.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Sign in with an administrator account to manage users, designs,
            reports, and platform health.
          </p>
          <Link
            href="/login"
            className="loome-button loome-button-primary mt-7"
          >
            Sign in as admin
          </Link>
        </div>
      </main>
    );
  if (!hasAccess)
    return (
      <main className="loome-page-shell">
        <div className="mx-auto max-w-xl px-5 pt-40 pb-24 text-center">
          <p className="loome-kicker">Admin console</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            This room is for administrators.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Your designer account can use Explore, Upload, and Studio.
          </p>
          <Link
            href="/studio"
            className="loome-button loome-button-primary mt-7"
          >
            Back to Studio
          </Link>
        </div>
      </main>
    );
  const chartMax = Math.max(
    ...stats.uploads,
    ...stats.views,
    ...stats.likes,
    1,
  );
  const totalCategories =
    Object.values(stats.categoryMix).reduce((sum, value) => sum + value, 0) ||
    1;
  const removeDesign = async (design: Design) => {
    if (!window.confirm(`Delete “${design.title}” from Loome?`)) return;
    try {
      await deleteDesign(design.slug);
      setRecent((items) => items.filter((item) => item.slug !== design.slug));
      toast.success("Design removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete design",
      );
    }
  };
  const resolveReport = async (report: Report) => {
    await fetch(`/api/reports?id=${encodeURIComponent(report.id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    setReports((items) => items.filter((item) => item.id !== report.id));
    toast.success("Report resolved");
  };
  const setUserSuspended = async (user: ManagedUser) => {
    const suspended = !user.suspended;
    setUpdatingUserId(user.id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: user.id, suspended }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (!response.ok) {
      setUpdatingUserId(null);
      return toast.error(result.message || "Could not update user access");
    }
    setUsers((items) =>
      items.map((item) =>
        item.id === user.id ? { ...item, suspended } : item,
      ),
    );
    toast.success(suspended ? "User access suspended" : "User access restored");
    setUpdatingUserId(null);
  };
  const setUserRole = async (user: ManagedUser, role: ManagedUser["role"]) => {
    setUpdatingUserId(user.id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: user.id, role: role.toLowerCase() }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (!response.ok)
      toast.error(result.message || "Could not change user role");
    else {
      setUsers((items) =>
        items.map((item) => (item.id === user.id ? { ...item, role } : item)),
      );
      toast.success(`${user.name} is now ${role.toLowerCase()}`);
    }
    setUpdatingUserId(null);
  };
  const deleteUser = async (user: ManagedUser) => {
    if (
      !window.confirm(
        `Permanently delete ${user.name} and their Loome content?`,
      )
    )
      return;
    setUpdatingUserId(user.id);
    const response = await fetch(
      `/api/admin/users?id=${encodeURIComponent(user.id)}`,
      { method: "DELETE", credentials: "include" },
    );
    const result = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (!response.ok) toast.error(result.message || "Could not delete user");
    else {
      setUsers((items) => items.filter((item) => item.id !== user.id));
      setRecent((items) => items.filter((item) => item.ownerId !== user.id));
      setStats((current) => ({
        ...current,
        activeDesigners: Math.max(0, current.activeDesigners - 1),
      }));
      toast.success("User and owned content deleted");
    }
    setUpdatingUserId(null);
  };
  return (
    <main className="loome-page-shell">
      <div className="loome-section pt-32 pb-24 lg:pt-40">
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="loome-kicker justify-start">
              <span className="loome-kicker-dot" /> Admin console
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              A clear view of Loome.
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Manage people, projects, reports, and the health of the room.
            </p>
          </div>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="field w-fit py-3"
          >
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Active designers",
              value: stats.activeDesigners.toLocaleString(),
              icon: <Users size={17} />,
            },
            {
              label: "Published designs",
              value: stats.publishedDesigns.toLocaleString(),
              icon: <ImageIcon size={17} />,
            },
            {
              label: "Reports to review",
              value: reports.length.toString(),
              icon: <Flag size={17} />,
            },
            {
              label: "Reporting window",
              value: range,
              icon: <TrendingUp size={17} />,
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                {stat.icon}
              </span>
              <p className="mt-6 text-2xl font-bold text-slate-950">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <div className="loome-card p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold">Platform signals</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Uploads, views, and likes · {range}
                </p>
              </div>
              <BarChart3 size={18} className="text-violet-500" />
            </div>
            <div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">
              {stats.uploads.map((value, index) => (
                <div
                  key={index}
                  className="group flex h-full flex-1 flex-col justify-end gap-2"
                >
                  <div className="relative flex flex-1 items-end gap-0.5">
                    <div
                      style={{ height: `${(value / chartMax) * 100}%` }}
                      className="w-1/3 rounded-t-lg bg-slate-950 transition group-hover:bg-violet-700"
                    />
                    <div
                      style={{
                        height: `${((stats.views[index] || 0) / chartMax) * 100}%`,
                      }}
                      className="w-1/3 rounded-t-lg bg-violet-200 transition group-hover:bg-violet-400"
                    />
                    <div
                      style={{
                        height: `${((stats.likes[index] || 0) / chartMax) * 100}%`,
                      }}
                      className="w-1/3 rounded-t-lg bg-sky-200 transition group-hover:bg-sky-400"
                    />
                  </div>
                  <span className="text-center text-[10px] font-bold text-slate-400">
                    W{index + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-5 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-slate-950" />
                Uploads
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-violet-200" />
                Views
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-sky-200" />
                Likes
              </span>
            </div>
          </div>
          <div className="loome-card p-5 sm:p-7">
            <p className="text-sm font-bold">Category mix</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              What the community is sharing
            </p>
            <div className="mt-8 space-y-5">
              {Object.entries(stats.categoryMix).map(([name, value], index) => (
                <div key={name}>
                  <div className="flex justify-between text-xs font-bold">
                    <span>{name}</span>
                    <span className="text-slate-400">
                      {Math.round((value / totalCategories) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      style={{ width: `${(value / totalCategories) * 100}%` }}
                      className={`h-full rounded-full ${index % 3 === 0 ? "bg-violet-500" : index % 3 === 1 ? "bg-sky-300" : "bg-pink-300"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="loome-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <div>
                <p className="text-sm font-bold">Manage designs</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Review or remove recent work
                </p>
              </div>
              <Link
                href="/explore"
                className="text-xs font-extrabold text-violet-600"
              >
                View archive
              </Link>
            </div>
            {recent.map((design) => (
              <div
                key={design.slug}
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <ImageIcon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {design.title}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      {design.creator} · {design.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDesign(design)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"
                  aria-label={`Delete ${design.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="loome-card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-5">
              <p className="text-sm font-bold">Reported content</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Resolve reports after review
              </p>
            </div>
            {reports.length ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {report.designSlug}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {report.reason}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Reported by {report.reporter}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveReport(report)}
                    className="loome-button loome-button-secondary loome-button-sm shrink-0"
                  >
                    <Check size={13} /> Resolve
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <ShieldAlert className="mx-auto text-emerald-500" size={22} />
                <p className="mt-3 text-sm font-bold text-slate-900">
                  No reports waiting.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  The moderation queue is clear.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 loome-card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5">
            <p className="text-sm font-bold">Manage users</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Accounts registered through Loome authentication
            </p>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_140px_220px] gap-4 border-b border-slate-100 bg-[#faf9fc] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400 sm:grid">
            <span>User</span>
            <span>Role</span>
            <span>Actions</span>
          </div>
          {users.map((user) => {
            const isSuspended = !!user.suspended;
            const busy = updatingUserId === user.id;
            return (
              <div
                key={user.id}
                className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 sm:grid-cols-[minmax(0,1fr)_140px_220px] sm:items-center sm:py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-50 text-xs font-extrabold text-violet-700">
                    {user.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate mt-1 text-xs text-slate-400">
                      {user.email}
                    </p>
                    {isSuspended && (
                      <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2 py-1 text-[10px] font-extrabold text-rose-600">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400 sm:hidden">
                    Role
                  </span>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      setUserRole(
                        user,
                        event.target.value as ManagedUser["role"],
                      )
                    }
                    disabled={busy}
                    className="field w-full py-2.5 text-xs"
                  >
                    <option>Designer</option>
                    <option>Admin</option>
                  </select>
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    disabled={busy}
                    onClick={() => setUserSuspended(user)}
                    className={`loome-button loome-button-sm flex-1 sm:flex-none ${isSuspended ? "loome-button-primary" : "loome-button-secondary"}`}
                  >
                    {isSuspended ? "Restore" : "Suspend"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => deleteUser(user)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                    aria-label={`Delete ${user.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {!users.length && (
            <div className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
              No registered users found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
