import { authClient } from "@/lib/auth-client";
import type { Design } from "@/lib/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  init?: RequestInit,
  authenticated = false,
) {
  const headers = new Headers(init?.headers);
  if (authenticated) {
    const { data } = await authClient.token();
    if (!data?.token) throw new Error("Sign in required.");
    headers.set("authorization", `Bearer ${data.token}`);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const fetchDesigns = (query = "") =>
  request<Design[]>(`/designs${query}`);
export const fetchDesign = (slug: string) =>
  request<Design>(`/designs/${encodeURIComponent(slug)}`);
export const createDesign = (payload: Partial<Design>) =>
  request<Design>(
    "/designs",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
    true,
  );
export const deleteDesign = (slug: string) =>
  request<{ deletedCount: number }>(
    `/designs/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
    true,
  );
export const likeDesign = (slug: string) =>
  request<{ likes: number }>(`/designs/${encodeURIComponent(slug)}/like`, {
    method: "POST",
  });
export const fetchComments = (slug: string) =>
  request<
    Array<{ id: string; userName: string; text: string; createdAt: string }>
  >(`/comments/${encodeURIComponent(slug)}`);
export const createComment = (designSlug: string, text: string) =>
  request<{ id: string; userName: string; text: string; createdAt: string }>(
    "/comments",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ designSlug, text }),
    },
    true,
  );
export const reportDesign = (designSlug: string, reason: string) =>
  request<{ id: string }>(
    "/reports",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ designSlug, reason }),
    },
    true,
  );
