import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const tables = await prisma.table.findMany({
    include: { guests: { select: { id: true } } },
    orderBy: { name: "asc" },
  });

  const result = tables.map((t) => ({
    id: t.id,
    name: t.name,
    section: t.section,
    type: t.type,
    capacity: t.capacity,
    guestIds: t.guests.map((g) => g.id),
    x: t.x,
    y: t.y,
    createdBy: t.createdBy,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();

    // Support batch creation
    const tablesData = Array.isArray(body) ? body : [body];

    const created = await Promise.all(
      tablesData.map((t: Record<string, unknown>) =>
        prisma.table.create({
          data: {
            name: t.name as string,
            section: t.section as string,
            type: t.type as string,
            capacity: (t.capacity as number) || 10,
            x: (t.x as number) || 0,
            y: (t.y as number) || 0,
            createdBy: auth.username,
          },
          include: { guests: { select: { id: true } } },
        })
      )
    );

    const result = created.map((t) => ({
      id: t.id,
      name: t.name,
      section: t.section,
      type: t.type,
      capacity: t.capacity,
      guestIds: t.guests.map((g) => g.id),
      x: t.x,
      y: t.y,
      createdBy: t.createdBy,
    }));

    for (const t of created) {
      await logActivity("הוספה", "שולחן", t.name, auth.username);
    }

    return Response.json(Array.isArray(body) ? result : result[0], { status: 201 });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const { id, guestIds, ...updates } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    // If guestIds provided, update guest assignments
    if (guestIds !== undefined) {
      // Remove all current guest assignments
      await prisma.guest.updateMany({
        where: { tableId: id },
        data: { tableId: null },
      });
      // Assign new guests
      if (guestIds.length > 0) {
        await prisma.guest.updateMany({
          where: { id: { in: guestIds } },
          data: { tableId: id },
        });
      }
    }

    const table = await prisma.table.update({
      where: { id },
      data: updates,
      include: { guests: { select: { id: true } } },
    });

    const changedFields = Object.keys(updates).filter(k => k !== "id").join(", ");
    await logActivity("עדכון", "שולחן", table.name, auth.username, changedFields || (guestIds !== undefined ? "שיבוץ אורחים" : undefined));

    return Response.json({
      id: table.id,
      name: table.name,
      section: table.section,
      type: table.type,
      capacity: table.capacity,
      guestIds: table.guests.map((g) => g.id),
      x: table.x,
      y: table.y,
      createdBy: table.createdBy,
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

    const table = await prisma.table.findUnique({ where: { id } });

    // Unassign guests from this table
    await prisma.guest.updateMany({
      where: { tableId: id },
      data: { tableId: null },
    });

    await prisma.table.delete({ where: { id } });

    if (table) {
      await logActivity("מחיקה", "שולחן", table.name, auth.username);
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
