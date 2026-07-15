import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { loomeDb } from "@/lib/mongo";
import { getUser, isAdmin } from "@/lib/server-session";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user || !isAdmin(user))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const reports = await loomeDb
    .collection("reports")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(
    reports.map((report) => ({
      ...report,
      id: String(report.id || report._id),
    })),
  );
}
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  const body = (await request.json()) as {
    designSlug?: string;
    reason?: string;
  };
  if (!user)
    return NextResponse.json(
      { message: "Sign in to report content." },
      { status: 401 },
    );
  if (!body.designSlug || !body.reason?.trim())
    return NextResponse.json(
      { message: "Choose a reason before reporting." },
      { status: 400 },
    );
  const report = {
    id: new ObjectId().toHexString(),
    designSlug: body.designSlug,
    reason: body.reason.trim(),
    reporter: user.email,
    createdAt: new Date().toISOString(),
  };
  await loomeDb.collection("reports").insertOne(report);
  return NextResponse.json(report, { status: 201 });
}
export async function DELETE(request: NextRequest) {
  const user = await getUser(request);
  const id = new URL(request.url).searchParams.get("id");
  if (!user || !isAdmin(user))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const result = await loomeDb.collection("reports").deleteOne({ id });
  return NextResponse.json(result);
}
