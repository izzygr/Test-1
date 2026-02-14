"use client";

import { useWedding } from "@/lib/context";
import { useState, useRef, useMemo } from "react";
import {
  Guest,
  GuestGroup,
  InvitationStatus,
  Gender,
  GUEST_GROUP_LABELS,
  INVITATION_STATUS_LABELS,
} from "@/types";
import {
  Plus,
  Upload,
  Download,
  Search,
  Trash2,
  Edit3,
  Users,
  UserCheck,
  X,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import Papa from "papaparse";

function GuestFormModal({
  open,
  onClose,
  guest,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  guest?: Guest;
  onSave: (data: Omit<Guest, "id" | "rsvpLink">) => void;
}) {
  const [form, setForm] = useState<Omit<Guest, "id" | "rsvpLink">>({
    firstName: guest?.firstName || "",
    lastName: guest?.lastName || "",
    phone: guest?.phone || "",
    email: guest?.email || "",
    gender: guest?.gender || "male",
    group: guest?.group || "חתן_משפחה",
    side: guest?.side || "חתן",
    status: guest?.status || "טרם_הוזמן",
    numberOfGuests: guest?.numberOfGuests || 2,
    numberOfChildren: guest?.numberOfChildren || 0,
    dietaryNotes: guest?.dietaryNotes || "",
    notes: guest?.notes || "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-700 font-hebrew">
            {guest ? "עריכת אורח" : "הוספת אורח חדש"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">שם פרטי *</label>
              <input
                className="input-field"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="ישראל"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">שם משפחה *</label>
              <input
                className="input-field"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="כהן"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">טלפון</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="050-1234567"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">אימייל</label>
              <input
                className="input-field"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">מין</label>
              <select
                className="select-field"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
              >
                <option value="male">גבר</option>
                <option value="female">אישה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">צד</label>
              <select
                className="select-field"
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value as "חתן" | "כלה" })}
              >
                <option value="חתן">צד החתן</option>
                <option value="כלה">צד הכלה</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">קבוצה</label>
              <select
                className="select-field"
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value as GuestGroup })}
              >
                {Object.entries(GUEST_GROUP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">סטטוס</label>
              <select
                className="select-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as InvitationStatus })}
              >
                {Object.entries(INVITATION_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">מספר אורחים</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={form.numberOfGuests}
                onChange={(e) => setForm({ ...form, numberOfGuests: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">מספר ילדים</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.numberOfChildren}
                onChange={(e) => setForm({ ...form, numberOfChildren: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">הערות תזונה</label>
            <input
              className="input-field"
              value={form.dietaryNotes}
              onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
              placeholder="אלרגיות, דיאטה..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">הערות</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            className="btn-gold flex-1"
            onClick={() => {
              if (!form.firstName || !form.lastName) return;
              onSave(form);
              onClose();
            }}
          >
            {guest ? "עדכן" : "הוסף"}
          </button>
          <button className="btn-outline flex-1" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

function statusBadgeClass(status: InvitationStatus) {
  switch (status) {
    case "טרם_הוזמן": return "badge-pending";
    case "הוזמן": return "badge-invited";
    case "אישר": return "badge-confirmed";
    case "סירב": return "badge-declined";
    default: return "badge-pending";
  }
}

export default function GuestsPage() {
  const { data, addGuest, addGuests, updateGuest, deleteGuest } = useWedding();
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGuests = useMemo(() => {
    return data.guests.filter((g) => {
      const matchSearch =
        !search ||
        `${g.firstName} ${g.lastName}`.includes(search) ||
        g.phone.includes(search);
      const matchGroup = filterGroup === "all" || g.group === filterGroup;
      const matchStatus = filterStatus === "all" || g.status === filterStatus;
      const matchSide = filterSide === "all" || g.side === filterSide;
      const matchGender = filterGender === "all" || g.gender === filterGender;
      return matchSearch && matchGroup && matchStatus && matchSide && matchGender;
    });
  }, [data.guests, search, filterGroup, filterStatus, filterSide, filterGender]);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const guests: Omit<Guest, "id" | "rsvpLink">[] = [];
        for (const row of results.data as Record<string, string>[]) {
          const firstName = row["שם פרטי"] || row["first_name"] || row["firstName"] || "";
          const lastName = row["שם משפחה"] || row["last_name"] || row["lastName"] || "";
          if (!firstName && !lastName) continue;

          guests.push({
            firstName,
            lastName,
            phone: row["טלפון"] || row["phone"] || "",
            email: row["אימייל"] || row["email"] || "",
            gender: (row["מין"] === "נקבה" || row["gender"] === "female") ? "female" : "male",
            group: (row["קבוצה"] || row["group"] || "אחר") as GuestGroup,
            side: (row["צד"] === "כלה" || row["side"] === "כלה") ? "כלה" : "חתן",
            status: "טרם_הוזמן",
            numberOfGuests: Number(row["מספר אורחים"] || row["guests"] || 2),
            numberOfChildren: Number(row["ילדים"] || row["children"] || 0),
            dietaryNotes: row["הערות תזונה"] || row["dietary"] || "",
            notes: row["הערות"] || row["notes"] || "",
          });
        }
        if (guests.length > 0) {
          addGuests(guests);
        }
      },
    });
    e.target.value = "";
  };

  const handleExportCSV = () => {
    const csvData = data.guests.map((g) => ({
      "שם פרטי": g.firstName,
      "שם משפחה": g.lastName,
      "טלפון": g.phone,
      "אימייל": g.email || "",
      "מין": g.gender === "male" ? "זכר" : "נקבה",
      "צד": g.side,
      "קבוצה": GUEST_GROUP_LABELS[g.group],
      "סטטוס": INVITATION_STATUS_LABELS[g.status],
      "מספר אורחים": g.numberOfGuests,
      "ילדים": g.numberOfChildren,
      "הערות תזונה": g.dietaryNotes || "",
      "הערות": g.notes || "",
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPeople = filteredGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const totalChildren = filteredGuests.reduce((sum, g) => sum + g.numberOfChildren, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <Users className="w-8 h-8 text-gold-500" />
            ניהול אורחים
          </h1>
          <p className="text-gray-500 mt-1">
            {data.guests.length} משפחות | {totalPeople} אורחים | {totalChildren} ילדים
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-gold flex items-center gap-2" onClick={() => { setEditingGuest(undefined); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            הוספת אורח
          </button>
          <button className="btn-outline flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            ייבוא CSV
          </button>
          <button className="btn-outline flex items-center gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            ייצוא
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleCSVUpload} />
        </div>
      </div>

      {/* CSV Template Info */}
      <div className="card bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">ייבוא מקובץ Excel/CSV</p>
            <p className="text-xs text-blue-600 mt-1">
              עמודות נתמכות: שם פרטי, שם משפחה, טלפון, אימייל, מין (זכר/נקבה), צד (חתן/כלה), קבוצה, מספר אורחים, ילדים, הערות
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="input-field pr-10"
              placeholder="חיפוש לפי שם או טלפון..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn-outline flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            סינון
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gold-200">
            <select className="select-field" value={filterSide} onChange={(e) => setFilterSide(e.target.value)}>
              <option value="all">כל הצדדים</option>
              <option value="חתן">צד החתן</option>
              <option value="כלה">צד הכלה</option>
            </select>
            <select className="select-field" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
              <option value="all">כל הקבוצות</option>
              {Object.entries(GUEST_GROUP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select className="select-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">כל הסטטוסים</option>
              {Object.entries(INVITATION_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select className="select-field" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="all">גברים ונשים</option>
              <option value="male">גברים</option>
              <option value="female">נשים</option>
            </select>
          </div>
        )}
      </div>

      {/* Guest Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gold-200">
              <th className="text-right py-3 px-2 font-semibold text-navy-700">שם</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700">טלפון</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700 hidden md:table-cell">צד</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700 hidden md:table-cell">קבוצה</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700">סטטוס</th>
              <th className="text-center py-3 px-2 font-semibold text-navy-700">אורחים</th>
              <th className="text-center py-3 px-2 font-semibold text-navy-700 hidden sm:table-cell">ילדים</th>
              <th className="text-center py-3 px-2 font-semibold text-navy-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  {data.guests.length === 0
                    ? "אין אורחים עדיין. הוסיפו אורחים או ייבאו מקובץ CSV"
                    : "לא נמצאו אורחים התואמים את הסינון"}
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-100 table-row-hover">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${guest.gender === "male" ? "bg-blue-400" : "bg-pink-400"}`} />
                      <div>
                        <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                        {guest.createdBy && (
                          <p className="text-[11px] text-gray-400">נוסף ע״י {guest.createdBy}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600" dir="ltr">{guest.phone}</td>
                  <td className="py-3 px-2 text-gray-600 hidden md:table-cell">
                    <span className={`badge ${guest.side === "חתן" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}>
                      {guest.side}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 hidden md:table-cell">
                    {GUEST_GROUP_LABELS[guest.group]}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`badge ${statusBadgeClass(guest.status)}`}>
                      {INVITATION_STATUS_LABELS[guest.status]}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{guest.numberOfGuests}</td>
                  <td className="py-3 px-2 text-center text-gray-500 hidden sm:table-cell">{guest.numberOfChildren}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditingGuest(guest); setShowForm(true); }}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="עריכה"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`למחוק את ${guest.firstName} ${guest.lastName}?`)) {
                            deleteGuest(guest.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        title="מחיקה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary by Group */}
      <div className="card">
        <h3 className="text-lg font-bold text-navy-700 font-hebrew mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-gold-500" />
          סיכום לפי קבוצות
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(GUEST_GROUP_LABELS).map(([key, label]) => {
            const groupGuests = data.guests.filter((g) => g.group === key);
            if (groupGuests.length === 0) return null;
            const total = groupGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
            return (
              <div key={key} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-navy-700">{label}</p>
                <p className="text-lg font-bold text-gold-700">{total} <span className="text-sm font-normal text-gray-500">אורחים</span></p>
                <p className="text-xs text-gray-400">{groupGuests.length} משפחות</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Modal */}
      <GuestFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingGuest(undefined); }}
        guest={editingGuest}
        onSave={(formData) => {
          if (editingGuest) {
            updateGuest(editingGuest.id, formData);
          } else {
            addGuest(formData);
          }
        }}
      />
    </div>
  );
}
