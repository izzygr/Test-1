import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import bcryptjs from "bcryptjs";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return Response.json({ error: "אין הרשאת מנהל" }, { status: 403 });

  const users = await prisma.appUser.findMany({
    select: { id: true, username: true, displayName: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return Response.json({ error: "אין הרשאת מנהל" }, { status: 403 });

  try {
    const { username, password, displayName } = await request.json();

    if (!username || !password || !displayName) {
      return Response.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const exists = await prisma.appUser.findUnique({ where: { username } });
    if (exists) {
      return Response.json({ error: "שם משתמש כבר קיים" }, { status: 409 });
    }

    const hashed = await bcryptjs.hash(password, 10);
    const user = await prisma.appUser.create({
      data: { username, password: hashed, displayName, isAdmin: false },
      select: { id: true, username: true, displayName: true, isAdmin: true, createdAt: true },
    });

    return Response.json(user, { status: 201 });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return Response.json({ error: "אין הרשאת מנהל" }, { status: 403 });

  try {
    const { id, password, displayName } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (displayName) updateData.displayName = displayName;
    if (password) updateData.password = await bcryptjs.hash(password, 10);

    const user = await prisma.appUser.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, displayName: true, isAdmin: true, createdAt: true },
    });

    return Response.json(user);
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return Response.json({ error: "אין הרשאת מנהל" }, { status: 403 });

  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    const user = await prisma.appUser.findUnique({ where: { id } });
    if (!user) return Response.json({ error: "משתמש לא נמצא" }, { status: 404 });
    if (user.isAdmin) return Response.json({ error: "לא ניתן למחוק מנהל" }, { status: 403 });

    await prisma.appUser.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
