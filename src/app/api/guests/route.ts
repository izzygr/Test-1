import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const guests = await prisma.guest.findMany({
    include: { rsvpResponse: true },
    orderBy: { lastName: "asc" },
  });

  // Transform to match frontend format
  const result = guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    phone: g.phone,
    email: g.email,
    gender: g.gender,
    group: g.group,
    side: g.side,
    status: g.status,
    numberOfGuests: g.numberOfGuests,
    numberOfChildren: g.numberOfChildren,
    tableId: g.tableId,
    dietaryNotes: g.dietaryNotes,
    notes: g.notes,
    rsvpLink: g.rsvpLink,
    createdBy: g.createdBy,
    rsvpResponse: g.rsvpResponse
      ? {
          attending: g.rsvpResponse.attending,
          count: g.rsvpResponse.count,
          childrenCount: g.rsvpResponse.childrenCount,
          dietaryNotes: g.rsvpResponse.dietaryNotes,
          respondedAt: g.rsvpResponse.respondedAt.toISOString(),
        }
      : undefined,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();

    // Support batch creation
    const guestsData = Array.isArray(body) ? body : [body];

    const created = await Promise.all(
      guestsData.map((g: Record<string, unknown>) =>
        prisma.guest.create({
          data: {
            firstName: g.firstName as string,
            lastName: g.lastName as string,
            phone: g.phone as string,
            email: (g.email as string) || null,
            gender: g.gender as string,
            group: g.group as string,
            side: g.side as string,
            status: (g.status as string) || "טרם_הוזמן",
            numberOfGuests: (g.numberOfGuests as number) || 1,
            numberOfChildren: (g.numberOfChildren as number) || 0,
            tableId: (g.tableId as string) || null,
            dietaryNotes: (g.dietaryNotes as string) || null,
            notes: (g.notes as string) || null,
            rsvpLink: (g.rsvpLink as string) || randomUUID().replace(/-/g, "").slice(0, 16),
            createdBy: auth.username,
          },
          include: { rsvpResponse: true },
        })
      )
    );

    const result = created;

    // Log activity
    for (const g of created) {
      await logActivity("הוספה", "אורח", `${g.firstName} ${g.lastName}`, auth.username);
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
    const { id, ...updates } = await request.json();
    if (!id) return Response.json({ error: "מזהה נדרש" }, { status: 400 });

    const guest = await prisma.guest.update({
      where: { id },
      data: updates,
      include: { rsvpResponse: true },
    });

    const changedFields = Object.keys(updates).filter(k => k !== "id").join(", ");
    await logActivity("עדכון", "אורח", `${guest.firstName} ${guest.lastName}`, auth.username, changedFields);

    return Response.json(guest);
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

    const guest = await prisma.guest.findUnique({ where: { id } });
    await prisma.guest.delete({ where: { id } });

    if (guest) {
      await logActivity("מחיקה", "אורח", `${guest.firstName} ${guest.lastName}`, auth.username);
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
