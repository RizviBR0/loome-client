import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { loomeDb } from "@/lib/mongo";
import { getUser, isAdmin } from "@/lib/server-session";

type AppRole = "admin" | "designer";
type UserRecord = {
  _id: ObjectId;
  name: string;
  email: string;
  suspended?: boolean;
  appRole?: AppRole;
  createdAt?: Date;
};

async function requireAdmin(request: NextRequest) {
  const user = await getUser(request);
  return user && isAdmin(user) ? user : null;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request)))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const users = await loomeDb
    .collection<UserRecord>("user")
    .find(
      {},
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          suspended: 1,
          appRole: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(
    users.map((item) => ({
      id: item._id.toHexString(),
      name: item.name,
      email: item.email,
      suspended: !!item.suspended,
      role: isAdmin({ email: item.email, role: item.appRole })
        ? "Admin"
        : "Designer",
      createdAt: item.createdAt,
    })),
  );
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin)
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const body = (await request.json()) as {
    id?: string;
    suspended?: boolean;
    role?: AppRole;
  };
  if (
    !body.id ||
    !ObjectId.isValid(body.id) ||
    (typeof body.suspended !== "boolean" && !body.role)
  )
    return NextResponse.json(
      { message: "A valid user and update are required." },
      { status: 400 },
    );
  if (body.role && !["admin", "designer"].includes(body.role))
    return NextResponse.json(
      { message: "Role must be admin or designer." },
      { status: 400 },
    );
  if (
    body.id === admin.id &&
    (body.suspended === true || body.role === "designer")
  )
    return NextResponse.json(
      { message: "You cannot suspend or demote your own account." },
      { status: 400 },
    );
  const updates: { suspended?: boolean; appRole?: AppRole; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (typeof body.suspended === "boolean") updates.suspended = body.suspended;
  if (body.role) updates.appRole = body.role;
  const result = await loomeDb
    .collection<UserRecord>("user")
    .updateOne({ _id: new ObjectId(body.id) }, { $set: updates });
  if (!result.matchedCount)
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  return NextResponse.json({ modifiedCount: result.modifiedCount });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin)
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!ObjectId.isValid(id))
    return NextResponse.json(
      { message: "A valid user is required." },
      { status: 400 },
    );
  if (id === admin.id)
    return NextResponse.json(
      { message: "You cannot delete your own account." },
      { status: 400 },
    );
  const userId = new ObjectId(id);
  const target = await loomeDb
    .collection<UserRecord>("user")
    .findOne({ _id: userId });
  if (!target)
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  const owned = await loomeDb
    .collection("designs")
    .find({ ownerId: id }, { projection: { slug: 1 } })
    .toArray();
  const slugs = owned.map((item) => String(item.slug));
  await Promise.all([
    loomeDb.collection("user").deleteOne({ _id: userId }),
    loomeDb.collection("account").deleteMany({ userId }),
    loomeDb.collection("session").deleteMany({ userId }),
    loomeDb.collection("verification").deleteMany({ identifier: target.email }),
    loomeDb.collection("designs").deleteMany({ ownerId: id }),
    loomeDb
      .collection("comments")
      .deleteMany({
        $or: [
          { userId: id },
          ...(slugs.length ? [{ designSlug: { $in: slugs } }] : []),
        ],
      }),
    loomeDb
      .collection("reports")
      .deleteMany({
        $or: [
          { reporter: target.email },
          ...(slugs.length ? [{ designSlug: { $in: slugs } }] : []),
        ],
      }),
  ]);
  return NextResponse.json({ deletedCount: 1 });
}
