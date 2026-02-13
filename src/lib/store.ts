"use client";

import { WeddingData, ChecklistItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "simchat-chatan-data";

const DEFAULT_CHECKLIST: Omit<ChecklistItem, "id">[] = [
  // 6+ months before
  { title: "קביעת תאריך החתונה", category: "כללי", assignee: "משותף", dueWeeksBefore: 26, completed: false, description: "תיאום עם הרבנים ובדיקת זמינות אולמות" },
  { title: "הזמנת אולם אירועים", category: "אולם", assignee: "משותף", dueWeeksBefore: 26, completed: false, description: "סיור באולמות, בדיקת כשרות, והשוואת מחירים" },
  { title: "בחירת רב מסדר קידושין", category: "טקס", assignee: "הורי_חתן", dueWeeksBefore: 24, completed: false, description: "פנייה לרב ותיאום" },
  { title: "הזמנת קייטרינג", category: "קייטרינג", assignee: "משותף", dueWeeksBefore: 24, completed: false, description: "טעימות, בדיקת כשרות (בד\"ץ/רבנות)" },
  { title: "הזמנת צלם ווידאו", category: "ספקים", assignee: "משותף", dueWeeksBefore: 22, completed: false, description: "צפייה בתיקי עבודות, בדיקת זמינות" },
  { title: "הזמנת תזמורת / DJ", category: "ספקים", assignee: "חתן", dueWeeksBefore: 22, completed: false, description: "האזנה להופעות, סגירת רפרטואר" },
  // 4-5 months before
  { title: "הכנת רשימת מוזמנים", category: "אורחים", assignee: "משותף", dueWeeksBefore: 20, completed: false, description: "רשימת משפחות, חברים, רבנים" },
  { title: "הזמנת שמלת כלה", category: "לבוש", assignee: "כלה", dueWeeksBefore: 20, completed: false, description: "מדידות והתאמות" },
  { title: "הזמנת חליפת חתן", category: "לבוש", assignee: "חתן", dueWeeksBefore: 18, completed: false, description: "חליפה, כובע, נעליים" },
  { title: "הזמנת פרחים ועיצוב", category: "ספקים", assignee: "כלה", dueWeeksBefore: 18, completed: false, description: "עיצוב חופה, שולחנות, כניסה" },
  // 3 months before
  { title: "עיצוב והדפסת הזמנות", category: "הזמנות", assignee: "משותף", dueWeeksBefore: 14, completed: false, description: "עיצוב, הגהה, הדפסה" },
  { title: "וורט / תנאים", category: "אירועים", assignee: "הורי_חתן", dueWeeksBefore: 14, completed: false, description: "ארגון אירוע הוורט / תנאים" },
  { title: "הזמנת הסעות", category: "תחבורה", assignee: "הורי_חתן", dueWeeksBefore: 12, completed: false, description: "אוטובוסים לאורחים" },
  // 2 months before
  { title: "משלוח הזמנות", category: "הזמנות", assignee: "משותף", dueWeeksBefore: 8, completed: false, description: "שליחת הזמנות פיזיות ודיגיטליות" },
  { title: "סידור דירה", category: "כללי", assignee: "משותף", dueWeeksBefore: 8, completed: false, description: "שכירות, ריהוט, מוצרי חשמל" },
  { title: "קניית טבעות", category: "טקס", assignee: "חתן", dueWeeksBefore: 6, completed: false, description: "טבעת חלקה לקידושין" },
  // 1 month before
  { title: "אישור סופי - אולם וקייטרינג", category: "אולם", assignee: "הורי_חתן", dueWeeksBefore: 4, completed: false, description: "מספר מנות סופי" },
  { title: "מפת סיטינג", category: "אורחים", assignee: "משותף", dueWeeksBefore: 4, completed: false, description: "סידור שולחנות גברים ונשים" },
  { title: "תיאום עם כל הספקים", category: "ספקים", assignee: "משותף", dueWeeksBefore: 3, completed: false, description: "אישור סופי של שעות, כתובות, ציוד" },
  // Week of wedding
  { title: "שבת אויפרוף", category: "אירועים", assignee: "הורי_חתן", dueWeeksBefore: 1, completed: false, description: "עליה לתורה של החתן, קידוש" },
  { title: "שבת כלה", category: "אירועים", assignee: "הורי_כלה", dueWeeksBefore: 1, completed: false, description: "שבת עם חברות הכלה" },
  { title: "תענית כלה וחתן", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, completed: false, description: "צום ביום החתונה" },
  { title: "קבלת פנים", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, completed: false, description: "חתן - תיש, כלה - כיסא כלה" },
  { title: "בדיקן", category: "טקס", assignee: "חתן", dueWeeksBefore: 0, completed: false, description: "החתן מכסה את פני הכלה" },
  { title: "חופה וקידושין", category: "טקס", assignee: "משותף", dueWeeksBefore: 0, completed: false, description: "חופה, שבע ברכות, שבירת כוס" },
  // After wedding
  { title: "שבע ברכות - יום 1", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, completed: false, description: "סעודה ראשונה" },
  { title: "שבע ברכות - יום 2", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, completed: false, description: "סעודה שנייה" },
  { title: "שבע ברכות - יום 3", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, completed: false, description: "סעודה שלישית" },
  { title: "שבע ברכות - יום 4", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, completed: false, description: "סעודה רביעית" },
  { title: "שבע ברכות - יום 5", category: "שבע_ברכות", assignee: "הורי_חתן", dueWeeksBefore: -1, completed: false, description: "סעודה חמישית" },
  { title: "שבע ברכות - יום 6", category: "שבע_ברכות", assignee: "הורי_כלה", dueWeeksBefore: -1, completed: false, description: "סעודה שישית" },
  { title: "שבע ברכות - שבת חתן", category: "שבע_ברכות", assignee: "משותף", dueWeeksBefore: -1, completed: false, description: "שבת חתן - סעודה שביעית" },
];

export function getDefaultData(): WeddingData {
  return {
    weddingDate: "",
    groomName: "",
    brideName: "",
    groomFamily: "",
    brideFamily: "",
    venue: "",
    guests: [],
    tables: generateDefaultTables(),
    budget: [],
    totalBudget: 150000,
    vendors: [],
    checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item, id: uuidv4() })),
    language: "he",
  };
}

function generateDefaultTables(): import("@/types").Table[] {
  const tables: import("@/types").Table[] = [];

  // Men's side
  tables.push({
    id: uuidv4(), name: "שולחן כבוד - גברים", section: "גברים", type: "כבוד", capacity: 12,
    guestIds: [], x: 50, y: 10,
  });
  tables.push({
    id: uuidv4(), name: "שולחן רבנים", section: "גברים", type: "רבנים", capacity: 10,
    guestIds: [], x: 50, y: 25,
  });
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: uuidv4(), name: `שולחן גברים ${i}`, section: "גברים", type: i <= 2 ? "משפחה" : "רגיל",
      capacity: 10, guestIds: [], x: 15 + ((i - 1) % 4) * 23, y: 40 + Math.floor((i - 1) / 4) * 20,
    });
  }

  // Women's side
  tables.push({
    id: uuidv4(), name: "שולחן כבוד - נשים", section: "נשים", type: "כבוד", capacity: 12,
    guestIds: [], x: 50, y: 10,
  });
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: uuidv4(), name: `שולחן נשים ${i}`, section: "נשים", type: i <= 2 ? "משפחה" : "רגיל",
      capacity: 10, guestIds: [], x: 15 + ((i - 1) % 4) * 23, y: 30 + Math.floor((i - 1) / 4) * 20,
    });
  }

  return tables;
}

export function loadData(): WeddingData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaults = getDefaultData();
      return { ...defaults, ...parsed };
    }
  } catch {
    // ignore
  }
  return getDefaultData();
}

export function saveData(data: WeddingData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function exportToJson(data: WeddingData): string {
  return JSON.stringify(data, null, 2);
}
