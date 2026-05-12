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
  Users,
} from "lucide-react";
import Papa from "papaparse";

interface PreviewRow {
  firstName: string;
  lastName: string;
  gender?: "male" | "female";
  numberOfGuests: number;
  isCouple: boolean;
  maleName: string;
  femaleName: string;
}

type MappedField = "firstName" | "lastName" | "gender" | "numberOfGuests";

const COLUMN_MAP: Record<string, MappedField> = {
  "שם פרטי": "firstName",
  "שם": "firstName",
  "first_name": "firstName",
  "firstname": "firstName",
  "name": "firstName",
  "שם משפחה": "lastName",
  "משפחה": "lastName",
  "last_name": "lastName",
  "lastname": "lastName",
  "מין": "gender",
  "gender": "gender",
  "מספר אורחים": "numberOfGuests",
  "אורחים": "numberOfGuests",
  "guests": "numberOfGuests",
  "כמות": "numberOfGuests",
};

function resolveGender(value: string): "male" | "female" | undefined {
  const v = value.trim().toLowerCase();
  if (v === "נקבה" || v === "female" || v === "f" || v === "אישה" || v === "נ") return "female";
  if (v === "זכר" || v === "male" || v === "m" || v === "גבר" || v === "ז") return "male";
  return undefined;
}

function detectCouple(firstName: string): { isCouple: boolean; maleName: string; femaleName: string } {
  const separators = [" ו", " and ", " & ", " + "];
  for (const sep of separators) {
    const idx = firstName.indexOf(sep);
    if (idx > 0) {
      const part1 = firstName.slice(0, idx).trim();
      const part2 = firstName.slice(idx + sep.length).trim();
      if (part1 && part2) {
        return { isCouple: true, maleName: part1, femaleName: part2 };
      }
    }
  }
  return { isCouple: false, maleName: firstName, femaleName: "" };
}

function parseRow(row: Record<string, string>): PreviewRow {
  const mapped: Record<string, string> = {};
  for (const [csvCol, value] of Object.entries(row)) {
    const normalized = csvCol.trim().toLowerCase();
    const key = COLUMN_MAP[normalized] || COLUMN_MAP[csvCol.trim()];
    if (key) mapped[key] = value?.trim() || "";
  }

  const firstName = mapped["firstName"] || "";
  const lastName = mapped["lastName"] || "";
  const gender = mapped["gender"] ? resolveGender(mapped["gender"]) : undefined;
  const couple = detectCouple(firstName);

  const numberOfGuests = Number(mapped["numberOfGuests"]) || 2;

  return {
    firstName,
    lastName,
    gender,
    numberOfGuests,
    ...couple,
  };
}

function downloadTemplate() {
  const headers = ["שם פרטי", "שם משפחה"];
  const examples = [
    ["ישראל", "כהן"],
    ["שרה", "לוי"],
    ["דוד ורחל", "מזרחי"],
  ];
  const csv = Papa.unparse({ fields: headers, data: examples });
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guest-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function rowsToGuests(
  rows: PreviewRow[],
  globalSide: "חתן" | "כלה",
  globalGroup: GuestGroup
): Omit<Guest, "id" | "rsvpLink">[] {
  const guests: Omit<Guest, "id" | "rsvpLink">[] = [];
  for (const row of rows) {
    if (!row.firstName && !row.lastName) continue;

    const base = {
      lastName: row.lastName,
      phone: "",
      email: "",
      group: globalGroup,
      side: globalSide,
      status: "טרם_הוזמן" as const,
      numberOfGuests: row.numberOfGuests,
      numberOfChildren: 0,
      dietaryNotes: "",
      notes: "",
    };

    if (row.isCouple) {
      guests.push({ ...base, firstName: row.maleName, gender: "male" });
      guests.push({ ...base, firstName: row.femaleName, gender: "female" });
    } else {
      guests.push({
        ...base,
        firstName: row.firstName,
        gender: row.gender || "male",
      });
    }
  }
  return guests;
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
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [globalSide, setGlobalSide] = useState<"חתן" | "כלה">("חתן");
  const [globalGroup, setGlobalGroup] = useState<GuestGroup>("אחר");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setRows([]);
    setFileName("");
    setImporting(false);
    setDone(false);
    setImportCount(0);
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
        const parsed: PreviewRow[] = [];
        for (const rawRow of results.data as Record<string, string>[]) {
          const row = parseRow(rawRow);
          if (!row.firstName && !row.lastName) continue;
          parsed.push(row);
        }
        setRows(parsed);
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

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCouple = (index: number) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (row.isCouple) {
          return { ...row, isCouple: false, maleName: row.firstName, femaleName: "" };
        }
        const detected = detectCouple(row.firstName);
        if (detected.isCouple) {
          return { ...row, isCouple: true, maleName: detected.maleName, femaleName: detected.femaleName };
        }
        return { ...row, isCouple: true, maleName: row.firstName, femaleName: "" };
      })
    );
  };

  const updateCoupleName = (index: number, field: "maleName" | "femaleName", value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const updateGuestCount = (index: number, value: number) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, numberOfGuests: Math.max(1, value) } : row))
    );
  };

  const handleImport = () => {
    const guests = rowsToGuests(rows, globalSide, globalGroup);
    if (guests.length === 0) return;
    setImporting(true);
    setImportCount(guests.length);
    onImport(guests);
    setImporting(false);
    setDone(true);
  };

  if (!open) return null;

  const coupleCount = rows.filter((r) => r.isCouple).length;
  const totalGuests = rows.length + coupleCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto"
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
              {importCount} אורחים נוספו לרשימה
            </p>
            <button className="btn-gold" onClick={handleClose}>
              סגור
            </button>
          </div>
        ) : rows.length === 0 ? (
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

            {/* Template & Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">פורמט הקובץ</p>
                  <p className="text-xs text-blue-600 mt-1 mb-3">
                    הקובץ צריך לכלול עמודות: <strong>שם פרטי</strong> ו<strong>שם משפחה</strong>.
                    זוגות ניתן לכתוב כ&quot;ישראל ושרה&quot; בעמודת שם פרטי - המערכת תזהה ותפריד אותם אוטומטית.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTemplate();
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    הורדת תבנית לדוגמה
                  </button>
                </div>
              </div>
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

            {/* Global Settings */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">צד</label>
                <select className="select-field text-sm" value={globalSide} onChange={(e) => setGlobalSide(e.target.value as "חתן" | "כלה")}>
                  <option value="חתן">צד החתן</option>
                  <option value="כלה">צד הכלה</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">קבוצה</label>
                <select className="select-field text-sm" value={globalGroup} onChange={(e) => setGlobalGroup(e.target.value as GuestGroup)}>
                  {Object.entries(GUEST_GROUP_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gold-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-gold-700">{rows.length}</p>
                <p className="text-xs text-gold-600">שורות בקובץ</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-700">{totalGuests}</p>
                <p className="text-xs text-blue-600">אורחים לייבוא {coupleCount > 0 && `(${coupleCount} זוגות)`}</p>
              </div>
            </div>

            {/* Couple info */}
            {coupleCount > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-800">
                    {coupleCount} זוגות יפוצלו ל-{coupleCount * 2} רשומות נפרדות (גבר + אישה)
                  </span>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[40vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-2 px-3 font-medium text-navy-700 w-10">#</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">שם פרטי</th>
                    <th className="text-right py-2 px-3 font-medium text-navy-700">שם משפחה</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700 w-16">אורחים</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700">זוג</th>
                    <th className="text-center py-2 px-3 font-medium text-navy-700 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${row.isCouple ? "bg-purple-50/30" : ""}`}>
                      <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-3">
                        {row.isCouple ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              <input
                                className="input-field py-1 px-2 text-sm"
                                value={row.maleName}
                                onChange={(e) => updateCoupleName(i, "maleName", e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                              <input
                                className="input-field py-1 px-2 text-sm"
                                value={row.femaleName}
                                onChange={(e) => updateCoupleName(i, "femaleName", e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">{row.firstName}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-700">{row.lastName}</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="input-field w-14 py-1 px-1 text-center text-sm"
                          value={row.numberOfGuests}
                          onChange={(e) => updateGuestCount(i, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => toggleCouple(i)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            row.isCouple
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 inline-block ml-1" />
                          {row.isCouple ? "זוג" : "יחיד"}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => removeRow(i)}
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

            {/* Errors for couples without both names */}
            {rows.some((r) => r.isCouple && (!r.maleName || !r.femaleName)) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    יש זוגות עם שם חסר - מלאו את שני השמות
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                className="btn-gold flex-1 flex items-center justify-center gap-2"
                onClick={handleImport}
                disabled={importing || rows.length === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מייבא...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    ייבוא {totalGuests} אורחים
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
