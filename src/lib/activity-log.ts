import { prisma } from "@/lib/prisma";

export type ActionType = "הוספה" | "עדכון" | "מחיקה";
export type EntityType = "אורח" | "שולחן" | "תקציב" | "ספק" | "משימה" | "הגדרות";

export async function logActivity(
  action: ActionType,
  entityType: EntityType,
  entityName: string,
  username: string,
  details?: string
) {
  try {
    await prisma.activityLog.create({
      data: { action, entityType, entityName, username, details },
    });
  } catch {
    // Don't let logging failures break the main operation
  }
}
