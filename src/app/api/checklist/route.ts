import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const items = await prisma.checklistItem.findMany({
    orderBy: { dueWeeksBefore: "desc" },
  });

  const result = items.map((c) => ({
    ...c,
    completedAt: c.completedAt?.toISOString() || undefined,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const item = await prisma.checklistItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        assignee: body.assignee,
        dueWeeksBefore: body.dueWeeksBefore,
        completed: body.completed || false,
        createdBy: auth.username,
      },
    });
    return Response.json(item, { status: 201 });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const { id, toggle, ...updates } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    if (toggle) {
      const current = await prisma.checklistItem.findUnique({ where: { id } });
      if (!current) return Response.json({ error: "פריט לא נמצא" }, { status: 404 });

      const item = await prisma.checklistItem.update({
        where: { id },
        data: {
          completed: !current.completed,
          completedAt: !current.completed ? new Date() : null,
        },
      });
      return Response.json({
        ...item,
        completedAt: item.completedAt?.toISOString() || undefined,
      });
    }

    const item = await prisma.checklistItem.update({
      where: { id },
      data: updates,
    });
    return Response.json({
      ...item,
      completedAt: item.completedAt?.toISOString() || undefined,
    });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    await prisma.checklistItem.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
