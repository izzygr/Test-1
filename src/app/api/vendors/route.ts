import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json(vendors);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        category: body.category,
        phone: body.phone,
        email: body.email || null,
        price: body.price || 0,
        status: body.status || "בבדיקה",
        notes: body.notes || null,
        contractUrl: body.contractUrl || null,
        paymentDue: body.paymentDue || null,
        createdBy: auth.username,
      },
    });

    await logActivity("הוספה", "ספק", vendor.name, auth.username);

    return Response.json(vendor, { status: 201 });
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

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updates,
    });

    const changedFields = Object.keys(updates).filter(k => k !== "id").join(", ");
    await logActivity("עדכון", "ספק", vendor.name, auth.username, changedFields);

    return Response.json(vendor);
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

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    await prisma.vendor.delete({ where: { id } });

    if (vendor) {
      await logActivity("מחיקה", "ספק", vendor.name, auth.username);
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
