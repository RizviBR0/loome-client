import { NextRequest, NextResponse } from "next/server";
import { loomeDb } from "@/lib/mongo";
import { getUser } from "@/lib/server-session";
import { slugifyDesignTitle } from "@/lib/design-utils";
import type { Design } from "@/lib/types";
import type { Sort } from "mongodb";

const collection = () => loomeDb.collection<Design>("designs");

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim() || "";
  const category = params.get("category") || "";
  const tool = params.get("tool") || "";
  const color = params.get("color") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const sort = params.get("sort") || "newest";
  const filter: Record<string, unknown> = {};
  if (search) filter.$or = ["title", "creator", "category", "tool", "tags"].map((field) => ({ [field]: { $regex: search, $options: "i" } }));
  if (category) filter.category = category;
  if (tool) filter.tool = tool;
  if (color) filter.color = color;
  if (from || to) filter.postedAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  const order: Sort = sort === "liked" ? { likes: -1 } : sort === "viewed" ? { views: -1 } : { postedAt: -1 };
  return NextResponse.json(await collection().find(filter).sort(order).toArray());
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const body = await request.json() as Partial<Design>;
  if (!body.title?.trim() || !body.shortDescription?.trim() || !body.description?.trim() || !body.coverImage?.trim() || !body.category || !body.tool || !body.postedAt) return NextResponse.json({ message: "Complete all required project fields." }, { status: 400 });
  try { new URL(body.coverImage); } catch { return NextResponse.json({ message: "Cover image must be a valid URL." }, { status: 400 }); }
  const base = slugifyDesignTitle(body.title);
  const slug = await collection().findOne({ slug: base }) ? `${base}-${Date.now()}` : base;
  const design: Design = { slug, title: body.title.trim(), creator: user.name, handle: user.email.split("@")[0], avatar: user.image || "https://i.pravatar.cc/96", category: body.category, tool: body.tool, tags: [...new Set((body.tags || []).map((tag) => tag.trim()).filter(Boolean))], coverImage: body.coverImage.trim(), gallery: body.gallery?.length ? body.gallery : [body.coverImage.trim()], shortDescription: body.shortDescription.trim(), description: body.description.trim(), likes: 0, views: 0, postedAt: body.postedAt, color: body.color || "#f3e8ff", ownerId: user.id, createdAt: new Date().toISOString() };
  await collection().insertOne(design);
  return NextResponse.json(design, { status: 201 });
}
