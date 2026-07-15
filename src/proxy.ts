import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUser, isAdmin } from "@/lib/server-session";

export async function proxy(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin(user))
      return NextResponse.redirect(new URL("/studio", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/studio/:path*",
    "/admin/:path*",
    "/items/add/:path*",
    "/items/manage/:path*",
  ],
};
