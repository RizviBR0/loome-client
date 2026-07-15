"use client";

import { authClient } from "@/lib/auth-client";

export type LoomeUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "designer" | "admin";
};
type SessionShape = { user: LoomeUser };

export function useLoomeSession() {
  const session = authClient.useSession();
  const data = session.data as {
    user?: Omit<LoomeUser, "role"> & { appRole?: "admin" | "designer" };
  } | null;
  const email = data?.user?.email?.toLowerCase();
  const adminEmails = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@loome.design"
  )
    .split(",")
    .map((item) => item.trim().toLowerCase());
  const normalized = data?.user
    ? ({
        ...data,
        user: {
          ...data.user,
          role:
            data.user.appRole === "admin" || adminEmails.includes(email || "")
              ? ("admin" as const)
              : ("designer" as const),
        },
      } as SessionShape)
    : null;
  return { data: normalized, isPending: session.isPending };
}
