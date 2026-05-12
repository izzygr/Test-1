import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rsvpId = searchParams.get("id");

  if (!rsvpId) {
    return Response.json({ error: "מזהה RSVP נדרש" }, { status: 400 });
  }

  const guest = await prisma.guest.findFirst({
    where: { rsvpLink: rsvpId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      numberOfGuests: true,
      numberOfChildren: true,
      rsvpResponse: true,
    },
  });

  if (!guest) {
    return Response.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
  }

  const settings = await prisma.weddingSettings.findFirst({ where: { id: "default" } });

  return Response.json({
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    numberOfGuests: guest.numberOfGuests,
    numberOfChildren: guest.numberOfChildren,
    rsvpResponse: guest.rsvpResponse
      ? {
          attending: guest.rsvpResponse.attending,
          count: guest.rsvpResponse.count,
          childrenCount: guest.rsvpResponse.childrenCount,
          dietaryNotes: guest.rsvpResponse.dietaryNotes,
          respondedAt: guest.rsvpResponse.respondedAt.toISOString(),
        }
      : undefined,
    wedding: settings
      ? {
          groomName: settings.groomName,
          brideName: settings.brideName,
          groomFamily: settings.groomFamily,
          brideFamily: settings.brideFamily,
          venue: settings.venue,
          weddingDate: settings.weddingDate,
        }
      : undefined,
  });
}

// Public endpoint - no auth required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rsvpId, attending, dietaryNotes } = body;

    if (!rsvpId || typeof attending !== "boolean") {
      return Response.json({ error: "נתונים חסרים" }, { status: 400 });
    }

    const count = Math.max(0, Math.min(20, Math.floor(Number(body.count) || 0)));
    const childrenCount = Math.max(0, Math.min(20, Math.floor(Number(body.childrenCount) || 0)));

    const guest = await prisma.guest.findFirst({
      where: { rsvpLink: rsvpId },
    });

    if (!guest) {
      return Response.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }

    const finalCount = attending ? Math.max(1, count) : 0;
    const finalChildren = attending ? childrenCount : 0;

    // Upsert RSVP response
    await prisma.rsvpResponse.upsert({
      where: { guestId: guest.id },
      update: {
        attending,
        count: finalCount,
        childrenCount: finalChildren,
        dietaryNotes: dietaryNotes || null,
        respondedAt: new Date(),
      },
      create: {
        guestId: guest.id,
        attending,
        count: finalCount,
        childrenCount: finalChildren,
        dietaryNotes: dietaryNotes || null,
      },
    });

    // Update guest status based on RSVP
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: attending ? "אישר" : "סירב",
        numberOfGuests: attending ? finalCount : guest.numberOfGuests,
        numberOfChildren: attending ? finalChildren : guest.numberOfChildren,
      },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
