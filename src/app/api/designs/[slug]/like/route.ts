import { NextResponse } from "next/server";
import { loomeDb } from "@/lib/mongo";
import type { Design } from "@/lib/types";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = await loomeDb.collection<Design>("designs").findOneAndUpdate({ slug }, { $inc: { likes: 1 } }, { returnDocument: "after" });
  return design ? NextResponse.json({ likes: design.likes }) : NextResponse.json({ message: "Design not found" }, { status: 404 });
}
