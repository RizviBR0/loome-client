import { NextRequest, NextResponse } from "next/server";
import { loomeDb } from "@/lib/mongo";
import { getUser, isAdmin } from "@/lib/server-session";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user || !isAdmin(user))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const [designs, activeDesigners, reportsToReview] = await Promise.all([
    loomeDb.collection("designs").find().toArray(),
    loomeDb.collection("user").countDocuments({ suspended: { $ne: true } }),
    loomeDb.collection("reports").countDocuments(),
  ]);
  const categoryMix: Record<string, number> = {};
  for (const item of designs)
    categoryMix[String(item.category)] =
      (categoryMix[String(item.category)] || 0) + 1;
  return NextResponse.json({
    activeDesigners,
    publishedDesigns: designs.length,
    reportsToReview,
    uploads: designs.map((item) => item.likes || 0),
    views: designs.map((item) => item.views || 0),
    likes: designs.map((item) => item.likes || 0),
    categoryMix,
  });
}
