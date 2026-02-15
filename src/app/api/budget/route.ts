import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const items = await prisma.budgetItem.findMany({
    orderBy: { category: "asc" },
  });

  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const item = await prisma.budgetItem.create({
      data: {
        category: body.category,
        description: body.description,
        planned: body.planned || 0,
        actual: body.actual || 0,
        paid: body.paid || false,
        notes: body.notes || null,
        createdBy: auth.username,
      },
    });

    await logActivity("הוספה", "תקציב", `${item.description} (${item.category})`, auth.username);

    return Response.json(item, { status: 201 });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const { id, ...updates } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    const item = await prisma.budgetItem.update({
      where: { id },
      data: updates,
    });

    const changedFields = Object.keys(updates).filter(k => k !== "id").join(", ");
    await logActivity("עדכון", "תקציב", `${item.description} (${item.category})`, auth.username, changedFields);

    return Response.json(item);
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

    const item = await prisma.budgetItem.findUnique({ where: { id } });
    await prisma.budgetItem.delete({ where: { id } });

    if (item) {
      await logActivity("מחיקה", "תקציב", `${item.description} (${item.category})`, auth.username);
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
