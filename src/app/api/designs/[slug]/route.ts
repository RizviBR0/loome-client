import { NextRequest, NextResponse } from "next/server";
import { loomeDb } from "@/lib/mongo";
import { getUser, isAdmin } from "@/lib/server-session";
import type { Design } from "@/lib/types";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loomeDb.collection<Design>("designs").findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { returnDocument: "after" });
  return result ? NextResponse.json(result) : NextResponse.json({ message: "Design not found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const design = await loomeDb.collection<Design>("designs").findOne({ slug });
  if (!design) return NextResponse.json({ message: "Design not found" }, { status: 404 });
  if (!isAdmin(user) && design.ownerId !== user.id) return NextResponse.json({ message: "You can only remove your own designs." }, { status: 403 });
  await loomeDb.collection<Design>("designs").deleteOne({ slug });
  await loomeDb.collection("comments").deleteMany({ designSlug: slug });
  return NextResponse.json({ deletedCount: 1 });
}
