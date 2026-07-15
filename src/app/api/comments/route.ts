import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { loomeDb } from "@/lib/mongo";
import { getUser } from "@/lib/server-session";

type Comment = { _id?: ObjectId; id: string; designSlug: string; userId: string; userName: string; text: string; createdAt: string };
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  return NextResponse.json(await loomeDb.collection<Comment>("comments").find({ designSlug: slug }).sort({ createdAt: -1 }).toArray());
}
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  const body = await request.json() as { designSlug?: string; text?: string };
  if (!user) return NextResponse.json({ message: "Sign in to comment." }, { status: 401 });
  if (!body.designSlug || !await loomeDb.collection("designs").findOne({ slug: body.designSlug })) return NextResponse.json({ message: "Design not found." }, { status: 404 });
  if (!body.text?.trim()) return NextResponse.json({ message: "Write a comment first." }, { status: 400 });
  const comment: Comment = { id: new ObjectId().toHexString(), designSlug: body.designSlug, userId: user.id, userName: user.name, text: body.text.trim(), createdAt: new Date().toISOString() };
  await loomeDb.collection<Comment>("comments").insertOne(comment);
  return NextResponse.json(comment, { status: 201 });
}
