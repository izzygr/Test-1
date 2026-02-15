import { PrismaClient } from "../src/generated/prisma/client.js";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CHECKLIST = [
  { title: "קביעת תאריך החתונה", category: "כללי", assignee: "משותף", dueWeeksBefore: 26, description: "תיאום עם הרבנים ובדיקת זמינות אולמות" },
  { title: "הזמנת אולם אירועים", category: "אולם", assignee: "משותף", dueWeeksBefore: 26, description: "סיור באולמות, בדיקת כשרות, והשוואת מחירים" },
  { title: "בחירת רב מסדר קידושין", category: "טקס", assignee: "הורי_חתן", dueWeeksBefore: 24, description: "פנייה לרב ותיאום" },
  { title: "הזמנת קייטרינג", category: "קייטרינג", assignee: "משותף", dueWeeksBefore: 24, description: 'טעימות, בדיקת כשרות (בד"ץ/רבנות)' },
  { title: "הזמנת צלם ווידאו", category: "ספקים", assignee: "משותף", dueWeeksBefore: 22, description: "צפייה בתיקי עבודות, בדיקת זמינות" },
  { title: "הזמנת תזמורת / DJ", category: "ספקים", assignee: "חתן", dueWeeksBefore: 22, description: "האזנה להופעות, סגירת רפרטואר" },
  { title: "הכנת רשימת מוזמנים", category: "אורחים", assignee: "משותף", dueWeeksBefore: 20, description: "רשימת משפחות, חברים, רבנים" },
  { title: "הזמנת שמלת כלה", category: "לבוש", assignee: "כלה", dueWeeksBefore: 20, description: "מדידות והתאמות" },
  { title: "הזמנת חליפת חתן", category: "לבוש", assignee: "חתן", dueWeeksBefore: 18, description: "חליפה, כובע, נעליים" },
  { title: "הזמנת פרחים ועיצוב", category: "ספקים", assignee: "כלה", dueWeeksBefore: 18, description: "עיצוב חופה, שולחנות, כניסה" },
  { title: "עיצוב והדפסת הזמנות", category: "הזמנות", assignee: "משותף", dueWeeksBefore: 14, description: "עיצוב, הגהה, הדפסה" },
  { title: "וורט / תנאים", category: "אירועים", assignee: "הורי_חתן", dueWeeksBefore: 14, description: "ארגון אירוע הוורט / תנאים" },
  { title: "הזמנת הסעות", category: "תחבורה", assignee: "הורי_חתן", dueWeeksBefore: 12, description: "אוטובוסים לאורחים" },
  { title: "משלוח הזמנות", category: "הזמנות", assignee: "משותף", dueWeeksBefore: 8, description: "שליחת הזמנות פיזיות ודיגיטליות" },
  { title: "סידור דירה", category: "כללי", assignee: "משותף", dueWeeksBefore: 8, description: "שכירות, ריהוט, מוצרי חשמל" },
  { title: "קניית טבעות", category: "טקס", assignee: "חתן", dueWeeksBefore: 6, description: "טבעת חלקה לקידושין" },
  { title: "אישור סופי - אולם וקייטרינג", category: "אולם", assignee: "הורי_חתן", dueWeeksBefore: 4, description: "מספר מנות סופי" },
  { title: "מפת סיטינג", category: "אורחים", assignee: "משותף", dueWeeksBefore: 4, description: "סידור שולחנות גברים ונשים" },
  { title: "תיאום עם כל הספקים", category: "ספקים", assignee: "משותף", dueWeeksBefore: 3, description: "אישור סופי של שעות, כתובות, ציוד" },
  { title: "שבת אויפרוף", category: "אירועים", assignee: "הורי_חתן", dueWeeksBefore: 1, description: "עליה לתורה של החתן, קידוש" },
  { title: "שבת כלה", category: "אירועים", assignee: "הורי_כלה", dueWeeksBefore: 1, description: "שבת עם חברות הכלה" },
  { title: "תענית כלה וחתן", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, description: "צום ביום החתונה" },
  { title: "קבלת פנים", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, description: "חתן - תיש, כלה - כיסא כלה" },
  { title: "בדיקן", category: "טקס", assignee: "חתן", dueWeeksBefore: 0, description: "החתן מכסה את פני הכלה" },
  { title: "חופה וקידושין", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, description: "חופה, שבע ברכות, שבירת כוס" },
  { title: "שבע ברכות - יום 1", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, description: "סעודה ראשונה" },
  { title: "שבע ברכות - יום 2", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, description: "סעודה שנייה" },
  { title: "שבע ברכות - יום 3", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, description: "סעודה שלישית" },
  { title: "שבע ברכות - יום 4", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, description: "סעודה רביעית" },
  { title: "שבע ברכות - יום 5", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, description: "סעודה חמישית" },
  { title: "שבע ברכות - יום 6", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, description: "סעודה שישית" },
  { title: "שבע ברכות - שבת חתן", category: "שבע_ברכות", assignee: "משותף", dueWeeksBefore: -1, description: "שבת חתן - סעודה שביעית" },
];

function generateDefaultTables() {
  const tables: { name: string; section: string; type: string; capacity: number; x: number; y: number }[] = [];

  tables.push({ name: "שולחן כבוד - גברים", section: "גברים", type: "כבוד", capacity: 12, x: 50, y: 10 });
  tables.push({ name: "שולחן רבנים", section: "גברים", type: "רבנים", capacity: 10, x: 50, y: 25 });

  for (let i = 1; i <= 8; i++) {
    tables.push({
      name: `שולחן גברים ${i}`,
      section: "גברים",
      type: i <= 2 ? "משפחה" : "רגיל",
      capacity: 10,
      x: 15 + ((i - 1) % 4) * 23,
      y: 40 + Math.floor((i - 1) / 4) * 20,
    });
  }

  tables.push({ name: "שולחן כבוד - נשים", section: "נשים", type: "כבוד", capacity: 12, x: 50, y: 10 });

  for (let i = 1; i <= 8; i++) {
    tables.push({
      name: `שולחן נשים ${i}`,
      section: "נשים",
      type: i <= 2 ? "משפחה" : "רגיל",
      capacity: 10,
      x: 15 + ((i - 1) % 4) * 23,
      y: 30 + Math.floor((i - 1) / 4) * 20,
    });
  }

  return tables;
}

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcryptjs.hash("1234", 10);
  await prisma.appUser.upsert({
    where: { username: "Yisrael" },
    update: {},
    create: {
      username: "Yisrael",
      password: hashedPassword,
      displayName: "ישראל (אדמין)",
      isAdmin: true,
    },
  });
  console.log("Admin user created");

  // Create default wedding settings
  await prisma.weddingSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("Wedding settings created");

  // Create default tables
  const existingTables = await prisma.table.count();
  if (existingTables === 0) {
    const tables = generateDefaultTables();
    for (const table of tables) {
      await prisma.table.create({ data: table });
    }
    console.log(`Created ${tables.length} default tables`);
  }

  // Create default checklist
  const existingChecklist = await prisma.checklistItem.count();
  if (existingChecklist === 0) {
    for (const item of DEFAULT_CHECKLIST) {
      await prisma.checklistItem.create({
        data: {
          ...item,
          completed: false,
        },
      });
    }
    console.log(`Created ${DEFAULT_CHECKLIST.length} checklist items`);
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
