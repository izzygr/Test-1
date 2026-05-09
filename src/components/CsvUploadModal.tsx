"use client";

import { useState, useRef, useCallback } from "react";
import { Guest, GuestGroup, GUEST_GROUP_LABELS } from "@/types";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";
import Papa from "papaparse";

type ParsedGuest = Omit<Guest, "id" | "rsvpLink">;

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const COLUMN_MAP: Record<string, keyof ParsedGuest> = {
  "שם פרטי": "firstName",
  "first_name": "firstName",
  "firstname": "firstName",
  "שם משפחה": "lastName",
  "last_name": "lastName",
  "lastname": "lastName",
  "טלפון": "phone",
  "phone": "phone",
  "אימייל": "email",
  "email": "email",
  "מין": "gender",
  "gender": "gender",
  "צד": "side",
  "side": "side",
  "קבוצה": "group",
  "group": "group",
  "מספר אורחים": "numberOfGuests",
  "guests": "numberOfGuests",
  "number_of_guests": "numberOfGuests",
  "ילדים": "numberOfChildren",
  "children": "numberOfChildren",
  "number_of_children": "numberOfChildren",
  "הערות תזונה": "dietaryNotes",
  "dietary": "dietaryNotes",
  "dietary_notes": "dietaryNotes",
  "הערות": "notes",
  "notes": "notes",
};

const VALID_GROUPS: string[] = Object.keys(GUEST_GROUP_LABELS);

const GROUP_NAME_TO_KEY: Record<string, GuestGroup> = {};
for (const [key, label] of Object.entries(GUEST_GROUP_LABELS)) {
  GROUP_NAME_TO_KEY[label] = key as GuestGroup;
  GROUP_NAME_TO_KEY[key] = key as GuestGroup;
}

function resolveGender(value: string): "male" | "female" {
  const v = value.trim().toLowerCase();
  if (v === "נקבה" || v === "female" || v === "f" || v === "אישה" || v === "נ") return "female";
  return "male";
}

function resolveSide(value: string): "חתן" | "כלה" {
  const v = value.trim();
  if (v === "כלה" || v === "bride") return "כלה";
  return "חתן";
}

function resolveGroup(value: string): GuestGroup {
  const v = value.trim();
  if (GROUP_NAME_TO_KEY[v]) return GROUP_NAME_TO_KEY[v];
  if (VALID_GROUPS.includes(v)) return v as GuestGroup;
  return "אחר";
}

function parseRow(row: Record<string, string>): ParsedGuest {
  const mapped: Record<string, string> = {};
  for (const [csvCol, value] of Object.entries(row)) {
    const key = COLUMN_MAP[csvCol.trim().toLowerCase()] || COLUMN_MAP[csvCol.trim()];
    if (key) mapped[key] = value;
  }

  return {
    firstName: mapped["firstName"] || "",
    lastName: mapped["lastName"] || "",
    phone: mapped["phone"] || "",
    email: mapped["email"] || "",
    gender: resolveGender(mapped["gender"] || "male"),
    group: resolveGroup(mapped["group"] || "אחר"),
    side: resolveSide(mapped["side"] || "חתן"),
    status: "טרם_הוזמן",
    numberOfGuests: Number(mapped["numberOfGuests"]) || 2,
    numberOfChildren: Number(mapped["numberOfChildren"]) || 0,
    dietaryNotes: mapped["dietaryNotes"] || "",
    notes: mapped["notes"] || "",
  };
}

function validateGuest(guest: ParsedGuest, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!guest.firstName && !guest.lastName) {
    errors.push({ row: rowIndex, field: "שם", message: "חסר שם פרטי ושם משפחה" });
  }
  if (guest.numberOfGuests < 1) {
    errors.push({ row: rowIndex, field: "מספר אורחים", message: "מספר אורחים חייב להיות לפחות 1" });
  }
  if (guest.numberOfChildren < 0) {
    errors.push({ row: rowIndex, field: "ילדים", message: "מספר ילדים לא יכול להיות שלילי" });
  }
  return errors;
}

function downloadTemplate() {
  const headers = ["שם פרטי", "שם משפחה", "טלפון", "אימייל", "מין", "צד", "קבוצה", "מספר אורחים", "ילדים", "הערות תזונה", "הערות"];
  const example = ["ישראל", "כהן", "050-1234567", "israel@email.com", "זכר", "חתן", "חתן_משפחה", "3", "1", "", ""];
  const csv = Papa.unparse({ fields: headers, data: [example] });
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guest-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CsvUploadModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (guests: Omit<Guest, "id" | "rsvpLink">[]) => void;
}) {
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setParsedGuests([]);
    setErrors([]);
    setFileName("");
    setImporting(false);
    setDone(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setDone(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const guests: ParsedGuest[] = [];
        const allErrors: ValidationError[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as Record<string, string>;
          const guest = parseRow(row);
          const rowErrors = validateGuest(guest, i + 1);

          if (rowErrors.some((e) => e.field === "שם")) continue;

          allErrors.push(...rowErrors);
          guests.push(guest);
        }

        setParsedGuests(guests);
        setErrors(allErrors);
      },
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeGuest = (index: number) => {
    setParsedGuests((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((e) => e.row !== index + 1));
  };

  const handleImport = async () => {
    if (parsedGuests.length === 0) return;
    setImporting(true);
    onImport(parsedGuests);
    setImporting(false);
    setDone(true);
  };

  if (!open) return null;

  const totalPeople = parsedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const totalChildren = parsedGuests.reduce((sum, g) => sum + g.numberOfChildren, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-700 font-hebrew flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-gold-500" />
            ייבוא אורחים מקובץ CSV
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-700 mb-2">הייבוא הושלם בהצלחה!</h3>
            <p className="text-gray-500 mb-6">
              {parsedGuests.length} משפחות ({totalPeople} אורחים) נוספו לרשימה
            </p>
            <button className="btn-gold" onClick={handleClose}>
              סגור
            </button>
          </div>
        ) : parsedGuests.length === 0 ? (
          <>
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-gold-500 bg-gold-50"
                  : "border-gray-300 hover:border-gold-400 hover:bg-gold-50/30"
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-gold-500" : "text-gray-400"}`} />
              <p className="text-lg font-medium text-navy-700 mb-1">גררו קובץ CSV לכאן</p>
              <p className="text-sm text-gray-500">או לחצו לבחירת קובץ</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Template Download */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">צריכים תבנית?</p>
                  <p className="text-xs text-blue-600 mt-1 mb-3">
                    הורידו קובץ CSV לדוגמה עם כל העמודות הנתמכות. ניתן להשתמש בעמודות בעברית או באנגלית.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTemplate();
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    הורדת תבנית
                  </button>
                </div>
              </div>
            </div>

            {/* Supported Columns */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-navy-700 mb-2">עמודות נתמכות:</p>
              <div className="flex flex-wrap gap-2">
                {["שם פרטי", "שם משפחה", "טלפון", "אימייל", "מין", "צד", "קבוצה", "מספר אורחים", "ילדים", "הערות תזונה", "הערות"].map((col) => (
                  <span key={col} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * שם פרטי ושם משפחה הם שדות חובה. ערכי ברירת מחדל: מין=זכר, צד=חתן, קבוצה=אחר, מספר אורחים=2
              </p>
            </div>
          </>
        ) : (
          <>
            {/* File Info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold-500" />
                <span className="text-sm font-medium text-navy-700">{fileName}</span>
              </div>
              <button onClick={reset} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                בחירת קובץ אחר
              </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">{errors.length} אזהרות</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-1 mr-6">
                  {errors.slice(0, 5).map((err, i) => (
                    <li key={i}>שורה {err.row}: {err.message}</li>
                  ))}
                  {errors.length > 5 && <li>...ועוד {errors.length - 5} אזהרות</li>}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gold-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-gold-700">{parsedGuests.length}</p>
                <p className="text-xs text-gold-600">משפחות</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-700">{totalPeople}</p>
                <p className="text-xs text-blue-600">אורחים</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-700">{totalChildren}</p>
                <p className="text-xs text-purple-600">ילדים</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[40vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-2 px-3 font-medium text-navy-700">#</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">שם</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">טלפון</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">מין</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">צד</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">קבוצה</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700">אורחים</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700">ילדים</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {parsedGuests.map((guest, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-3 font-medium">
                        {guest.firstName} {guest.lastName}
                      </td>
                      <td className="py-2 px-3 text-gray-600" dir="ltr">{guest.phone}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${guest.gender === "male" ? "bg-blue-400" : "bg-pink-400"}`} />
                      </td>
                      <td className="py-2 px-3">
                        <span className={`badge text-xs ${guest.side === "חתן" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}>
                          {guest.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs">
                        {GUEST_GROUP_LABELS[guest.group] || guest.group}
                      </td>
                      <td className="py-2 px-3 text-center">{guest.numberOfGuests}</td>
                      <td className="py-2 px-3 text-center text-gray-500">{guest.numberOfChildren}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => removeGuest(i)}
                          className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                className="btn-gold flex-1 flex items-center justify-center gap-2"
                onClick={handleImport}
                disabled={importing || parsedGuests.length === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מייבא...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    ייבוא {parsedGuests.length} משפחות
                  </>
                )}
              </button>
              <button className="btn-outline flex-1" onClick={handleClose}>
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
