"use client";

import { useState, useRef } from "react";
import { Download, Upload, AlertTriangle, CheckCircle2, Loader2, HardDrive, RefreshCw } from "lucide-react";

export default function BackupPage() {
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [doneRestore, setDoneRestore] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("שגיאה בייצוא");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wedding-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("שגיאה בייצוא הגיבוי. נסו שוב.");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!confirm("שחזור הגיבוי ימחוק את כל הנתונים הקיימים ויחליף אותם בנתונים מהקובץ.\n\nהאם להמשיך?")) return;

    setRestoring(true);
    setError("");
    setDoneRestore(false);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בשחזור");
      }

      setDoneRestore(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "קובץ גיבוי לא תקין");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
          <HardDrive className="w-8 h-8 text-gold-500" />
          גיבוי ושחזור
        </h1>
        <p className="text-gray-500 mt-1">ייצוא ושחזור כל נתוני החתונה</p>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {doneRestore && (
        <div className="card bg-green-50 border-green-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">השחזור הושלם בהצלחה! הדף נטען מחדש...</p>
        </div>
      )}

      {/* Export */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-navy-700 font-hebrew mb-1">ייצוא גיבוי</h2>
            <p className="text-sm text-gray-500 mb-4">
              מוריד קובץ JSON עם כל נתוני החתונה: אורחים, שולחנות, תקציב, ספקים ומשימות.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-gold flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  מייצא...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  הורדת גיבוי
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Restore */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-navy-700 font-hebrew mb-1">שחזור מגיבוי</h2>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>שים לב:</strong> שחזור ימחוק את <strong>כל הנתונים הקיימים</strong> ויחליף אותם בנתונים מהגיבוי. פעולה זו אינה הפיכה.
                </p>
              </div>
            </div>
            <label className={`btn-outline flex items-center gap-2 w-fit cursor-pointer ${restoring ? "opacity-50 pointer-events-none" : ""}`}>
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  משחזר...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  בחירת קובץ גיבוי
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">מה כלול בגיבוי?</h3>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li>פרטי החתונה (שמות, תאריך, אולם, תקציב)</li>
          <li>רשימת אורחים ואישורי הגעה</li>
          <li>סידור שולחנות</li>
          <li>פריטי תקציב</li>
          <li>ספקים</li>
          <li>משימות ורשימת צ׳קליסט</li>
        </ul>
      </div>
    </div>
  );
}
