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
  });
}

// Public endpoint - no auth required
export async function POST(request: NextRequest) {
  try {
    const { rsvpId, attending, count, childrenCount, dietaryNotes } = await request.json();

    if (!rsvpId) {
      return Response.json({ error: "מזהה RSVP נדרש" }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: { rsvpLink: rsvpId },
    });

    if (!guest) {
      return Response.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }

    // Upsert RSVP response
    await prisma.rsvpResponse.upsert({
      where: { guestId: guest.id },
      update: {
        attending,
        count: count || 1,
        childrenCount: childrenCount || 0,
        dietaryNotes: dietaryNotes || null,
        respondedAt: new Date(),
      },
      create: {
        guestId: guest.id,
        attending,
        count: count || 1,
        childrenCount: childrenCount || 0,
        dietaryNotes: dietaryNotes || null,
      },
    });

    // Update guest status based on RSVP
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: attending ? "אישר" : "סירב",
        numberOfGuests: count || guest.numberOfGuests,
        numberOfChildren: childrenCount ?? guest.numberOfChildren,
      },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
