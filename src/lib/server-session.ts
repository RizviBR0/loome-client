import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function getUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  const record = ObjectId.isValid(session.user.id)
    ? await (await import("@/lib/mongo")).loomeDb
        .collection("user")
        .findOne({ _id: new ObjectId(session.user.id) })
    : null;
  return record?.suspended
    ? null
    : {
        ...session.user,
        role: isAdmin({
          email: session.user.email,
          role: record?.appRole as string | undefined,
        })
          ? ("admin" as const)
          : ("designer" as const),
      };
}

export function isAdmin(
  value?: string | null | { email?: string | null; role?: string | null },
) {
  const email = typeof value === "string" ? value : value?.email;
  const role = typeof value === "object" && value ? value.role : undefined;
  const admins = (process.env.ADMIN_EMAILS || "admin@loome.design")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return role === "admin" || (!!email && admins.includes(email.toLowerCase()));
}
