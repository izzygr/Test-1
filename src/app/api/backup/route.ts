import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const [settings, guests, tables, budget, vendors, checklist] = await Promise.all([
    prisma.weddingSettings.findFirst({ where: { id: "default" } }),
    prisma.guest.findMany({ orderBy: { lastName: "asc" } }),
    prisma.table.findMany(),
    prisma.budgetItem.findMany(),
    prisma.vendor.findMany(),
    prisma.checklistItem.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    settings,
    guests,
    tables,
    budget,
    vendors,
    checklist,
  };

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="wedding-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const backup = await request.json();

    if (!backup.version || !Array.isArray(backup.guests) || !Array.isArray(backup.checklist)) {
      return Response.json({ error: "קובץ גיבוי לא תקין" }, { status: 400 });
    }

    // Delete in dependency order (FK constraints)
    await prisma.rsvpResponse.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.table.deleteMany();
    await prisma.budgetItem.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.checklistItem.deleteMany();

    // Restore settings
    if (backup.settings) {
      await prisma.weddingSettings.upsert({
        where: { id: "default" },
        update: {
          weddingDate: backup.settings.weddingDate || "",
          groomName: backup.settings.groomName || "",
          brideName: backup.settings.brideName || "",
          groomFamily: backup.settings.groomFamily || "",
          brideFamily: backup.settings.brideFamily || "",
          venue: backup.settings.venue || "",
          totalBudget: backup.settings.totalBudget || 150000,
          language: backup.settings.language || "he",
        },
        create: {
          id: "default",
          weddingDate: backup.settings.weddingDate || "",
          groomName: backup.settings.groomName || "",
          brideName: backup.settings.brideName || "",
          groomFamily: backup.settings.groomFamily || "",
          brideFamily: backup.settings.brideFamily || "",
          venue: backup.settings.venue || "",
          totalBudget: backup.settings.totalBudget || 150000,
          language: backup.settings.language || "he",
        },
      });
    }

    // Restore tables first (guests reference tables)
    if (backup.tables?.length > 0) {
      await prisma.table.createMany({
        data: backup.tables.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          name: t.name as string,
          section: t.section as string,
          type: t.type as string,
          capacity: (t.capacity as number) || 10,
          x: (t.x as number) || 0,
          y: (t.y as number) || 0,
          createdBy: (t.createdBy as string) || null,
        })),
      });
    }

    // Restore guests
    if (backup.guests?.length > 0) {
      await prisma.guest.createMany({
        data: backup.guests.map((g: Record<string, unknown>) => ({
          id: g.id as string,
          firstName: g.firstName as string,
          lastName: g.lastName as string,
          phone: (g.phone as string) || "",
          email: (g.email as string) || null,
          gender: (g.gender as string) || "male",
          group: (g.group as string) || "אחר",
          side: (g.side as string) || "חתן",
          status: (g.status as string) || "טרם_הוזמן",
          numberOfGuests: (g.numberOfGuests as number) || 1,
          numberOfChildren: (g.numberOfChildren as number) || 0,
          tableId: (g.tableId as string) || null,
          dietaryNotes: (g.dietaryNotes as string) || null,
          notes: (g.notes as string) || null,
          rsvpLink: (g.rsvpLink as string) || null,
          createdBy: (g.createdBy as string) || null,
        })),
      });
    }

    // Restore budget items
    if (backup.budget?.length > 0) {
      await prisma.budgetItem.createMany({
        data: backup.budget.map((b: Record<string, unknown>) => ({
          id: b.id as string,
          category: b.category as string,
          description: b.description as string,
          planned: (b.planned as number) || 0,
          actual: (b.actual as number) || 0,
          paid: (b.paid as boolean) || false,
          notes: (b.notes as string) || null,
          createdBy: (b.createdBy as string) || null,
        })),
      });
    }

    // Restore vendors
    if (backup.vendors?.length > 0) {
      await prisma.vendor.createMany({
        data: backup.vendors.map((v: Record<string, unknown>) => ({
          id: v.id as string,
          name: v.name as string,
          category: v.category as string,
          phone: (v.phone as string) || "",
          email: (v.email as string) || null,
          price: (v.price as number) || 0,
          status: (v.status as string) || "בבדיקה",
          notes: (v.notes as string) || null,
          contractUrl: (v.contractUrl as string) || null,
          paymentDue: (v.paymentDue as string) || null,
          createdBy: (v.createdBy as string) || null,
        })),
      });
    }

    // Restore checklist items
    if (backup.checklist?.length > 0) {
      await prisma.checklistItem.createMany({
        data: backup.checklist.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          title: c.title as string,
          description: (c.description as string) || null,
          category: c.category as string,
          assignee: c.assignee as string,
          dueWeeksBefore: (c.dueWeeksBefore as number) || 0,
          completed: (c.completed as boolean) || false,
          completedAt: c.completedAt ? new Date(c.completedAt as string) : null,
          createdBy: (c.createdBy as string) || null,
        })),
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("Backup restore error:", e);
    return Response.json({ error: "שגיאה בשחזור הגיבוי" }, { status: 500 });
  }
}
