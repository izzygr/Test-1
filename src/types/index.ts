export interface AppUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
}

export type Gender = "male" | "female";
export type GuestGroup =
  | "חתן_משפחה"
  | "כלה_משפחה"
  | "חברים_חתן"
  | "חברים_כלה"
  | "רבנים"
  | "ראשי_ישיבות"
  | "שכנים"
  | "עבודה"
  | "אחר";

export type InvitationStatus = "טרם_הוזמן" | "הוזמן" | "אישר" | "סירב";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  gender: Gender;
  group: GuestGroup;
  side: "חתן" | "כלה";
  status: InvitationStatus;
  numberOfGuests: number;
  numberOfChildren: number;
  tableId?: string;
  dietaryNotes?: string;
  notes?: string;
  rsvpLink?: string;
  createdBy?: string;
  rsvpResponse?: {
    attending: boolean;
    count: number;
    childrenCount: number;
    dietaryNotes?: string;
    respondedAt: string;
  };
}

export interface Table {
  id: string;
  name: string;
  section: "גברים" | "נשים";
  type: "כבוד" | "רבנים" | "משפחה" | "רגיל";
  capacity: number;
  guestIds: string[];
  x: number;
  y: number;
  createdBy?: string;
}

export type BudgetCategory =
  | "אולם"
  | "קייטרינג"
  | "צלם"
  | "וידאו"
  | "תזמורת"
  | "שמלה"
  | "חליפה"
  | "פרחים"
  | "הזמנות"
  | "רב_מסדר"
  | "תחבורה"
  | "שונות";

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  description: string;
  planned: number;
  actual: number;
  paid: boolean;
  notes?: string;
  createdBy?: string;
}

export type VendorStatus = "בבדיקה" | "נסגר" | "שולם" | "בוטל";

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  phone: string;
  email?: string;
  price: number;
  status: VendorStatus;
  notes?: string;
  contractUrl?: string;
  paymentDue?: string;
  createdBy?: string;
}

export type TaskAssignee = "חתן" | "כלה" | "הורי_חתן" | "הורי_כלה" | "משותף";

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  assignee: TaskAssignee;
  dueWeeksBefore: number;
  completed: boolean;
  completedAt?: string;
  createdBy?: string;
}

export interface WeddingData {
  weddingDate: string;
  groomName: string;
  brideName: string;
  groomFamily: string;
  brideFamily: string;
  venue: string;
  guests: Guest[];
  tables: Table[];
  budget: BudgetItem[];
  totalBudget: number;
  vendors: Vendor[];
  checklist: ChecklistItem[];
  language: "he" | "en";
}

export const GUEST_GROUP_LABELS: Record<GuestGroup, string> = {
  חתן_משפחה: "משפחת החתן",
  כלה_משפחה: "משפחת הכלה",
  חברים_חתן: "חברי החתן",
  חברים_כלה: "חברות הכלה",
  רבנים: "רבנים",
  ראשי_ישיבות: "ראשי ישיבות",
  שכנים: "שכנים",
  עבודה: "עבודה",
  אחר: "אחר",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  טרם_הוזמן: "טרם הוזמן",
  הוזמן: "הוזמן",
  אישר: "אישר הגעה",
  סירב: "סירב",
};

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  אולם: "אולם אירועים",
  קייטרינג: "קייטרינג",
  צלם: "צלם",
  וידאו: "וידאו",
  תזמורת: "תזמורת / DJ",
  שמלה: "שמלת כלה",
  חליפה: "חליפת חתן",
  פרחים: "פרחים ועיצוב",
  הזמנות: "הזמנות",
  רב_מסדר: "רב מסדר קידושין",
  תחבורה: "הסעות",
  שונות: "שונות",
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  בבדיקה: "בבדיקה",
  נסגר: "נסגר",
  שולם: "שולם",
  בוטל: "בוטל",
};
