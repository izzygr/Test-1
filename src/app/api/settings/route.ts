import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  let settings = await prisma.weddingSettings.findUnique({ where: { id: "default" } });

  if (!settings) {
    settings = await prisma.weddingSettings.create({
      data: { id: "default" },
    });
  }

  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const updates = await request.json();
    delete updates.id;

    const settings = await prisma.weddingSettings.upsert({
      where: { id: "default" },
      update: updates,
      create: { id: "default", ...updates },
    });

    const changedFields = Object.keys(updates).join(", ");
    await logActivity("עדכון", "הגדרות", "הגדרות חתונה", auth.username, changedFields);

    return Response.json(settings);
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
