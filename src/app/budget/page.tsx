"use client";

import { useWedding } from "@/lib/context";
import { useState, useMemo } from "react";
import {
  BudgetCategory,
  BudgetItem,
  BUDGET_CATEGORY_LABELS,
} from "@/types";
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from "lucide-react";

function BudgetFormModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item?: BudgetItem;
  onSave: (data: Omit<BudgetItem, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<BudgetItem, "id">>({
    category: item?.category || "אולם",
    description: item?.description || "",
    planned: item?.planned || 0,
    actual: item?.actual || 0,
    paid: item?.paid || false,
    notes: item?.notes || "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 font-hebrew">
            {item ? "עריכת הוצאה" : "הוספת הוצאה"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">קטגוריה</label>
            <select
              className="select-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as BudgetCategory })}
            >
              {Object.entries(BUDGET_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">תיאור</label>
            <input
              className="input-field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="תיאור ההוצאה..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">תקציב מתוכנן (₪)</label>
              <input
                type="number"
                className="input-field"
                value={form.planned}
                onChange={(e) => setForm({ ...form, planned: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">הוצאה בפועל (₪)</label>
              <input
                type="number"
                className="input-field"
                value={form.actual}
                onChange={(e) => setForm({ ...form, actual: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="w-4 h-4 rounded border-gold-300 text-gold-500 focus:ring-gold-500"
            />
            <label htmlFor="paid" className="text-sm font-medium text-gray-600">שולם</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">הערות</label>
            <textarea
              className="input-field min-h-[60px] resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-gold flex-1" onClick={() => { onSave(form); onClose(); }}>
            {item ? "עדכן" : "הוסף"}
          </button>
          <button className="btn-outline flex-1" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function BudgetPage() {
  const { data, addBudgetItem, updateBudgetItem, deleteBudgetItem, stats } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | undefined>();

  const categoryBreakdown = useMemo(() => {
    const map = new Map<BudgetCategory, { planned: number; actual: number }>();
    for (const item of data.budget) {
      const existing = map.get(item.category) || { planned: 0, actual: 0 };
      map.set(item.category, {
        planned: existing.planned + item.planned,
        actual: existing.actual + item.actual,
      });
    }
    return Array.from(map.entries()).sort((a, b) => b[1].actual - a[1].actual);
  }, [data.budget]);

  const totalPlanned = data.budget.reduce((sum, b) => sum + b.planned, 0);
  const budgetPercent = data.totalBudget > 0 ? Math.round((stats.budgetUsed / data.totalBudget) * 100) : 0;
  const isOverBudget = stats.budgetUsed > data.totalBudget;

  const categoryColors: Record<string, string> = {
    "אולם": "bg-blue-500", "קייטרינג": "bg-orange-500", "צלם": "bg-purple-500",
    "וידאו": "bg-indigo-500", "תזמורת": "bg-pink-500", "שמלה": "bg-rose-500",
    "חליפה": "bg-sky-500", "פרחים": "bg-green-500", "הזמנות": "bg-amber-500",
    "רב_מסדר": "bg-violet-500", "תחבורה": "bg-teal-500", "שונות": "bg-gray-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <Wallet className="w-8 h-8 text-gold-500" />
            ניהול תקציב
          </h1>
          <p className="text-gray-500 mt-1">מעקב הוצאות ותקציב החתונה</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setEditingItem(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          הוספת הוצאה
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">תקציב כולל</p>
          <p className="text-3xl font-bold text-navy-700 font-hebrew">₪{data.totalBudget.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">הוצאות בפועל</p>
          <p className={`text-3xl font-bold font-hebrew ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
            ₪{stats.budgetUsed.toLocaleString()}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">יתרה</p>
          <p className={`text-3xl font-bold font-hebrew ${stats.budgetRemaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
            ₪{stats.budgetRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">ניצול תקציב</span>
          <span className={`text-sm font-bold ${isOverBudget ? "text-red-600" : "text-gold-700"}`}>
            {budgetPercent}%
          </span>
        </div>
        <ProgressBar
          value={stats.budgetUsed}
          max={data.totalBudget}
          color={isOverBudget ? "bg-red-500" : budgetPercent > 80 ? "bg-amber-500" : "bg-green-500"}
        />
        {isOverBudget && (
          <div className="flex items-center gap-2 mt-3 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">חריגה מהתקציב!</span>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-navy-700 font-hebrew mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gold-500" />
            פילוח לפי קטגוריה
          </h3>
          <div className="space-y-4">
            {categoryBreakdown.map(([category, amounts]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {BUDGET_CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-sm text-gray-500">
                    ₪{amounts.actual.toLocaleString()} / ₪{amounts.planned.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={amounts.actual}
                  max={amounts.planned || amounts.actual}
                  color={categoryColors[category] || "bg-gray-500"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Items Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-bold text-navy-700 font-hebrew mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold-500" />
          פירוט הוצאות
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gold-200">
              <th className="text-right py-3 px-2 font-semibold text-navy-700">קטגוריה</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700">תיאור</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700">מתוכנן</th>
              <th className="text-right py-3 px-2 font-semibold text-navy-700">בפועל</th>
              <th className="text-center py-3 px-2 font-semibold text-navy-700">סטטוס</th>
              <th className="text-center py-3 px-2 font-semibold text-navy-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {data.budget.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  אין הוצאות עדיין. הוסיפו את ההוצאה הראשונה.
                </td>
              </tr>
            ) : (
              data.budget.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 table-row-hover">
                  <td className="py-3 px-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${categoryColors[item.category] || "bg-gray-400"} ml-2`} />
                    {BUDGET_CATEGORY_LABELS[item.category]}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-gray-600">{item.description}</span>
                    {item.createdBy && (
                      <p className="text-[11px] text-gray-400">נוסף ע״י {item.createdBy}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium">₪{item.planned.toLocaleString()}</td>
                  <td className="py-3 px-2 font-medium">₪{item.actual.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    {item.paid ? (
                      <span className="badge badge-confirmed">שולם</span>
                    ) : (
                      <span className="badge badge-pending">לא שולם</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("למחוק הוצאה זו?")) deleteBudgetItem(item.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data.budget.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gold-300 font-bold">
                <td className="py-3 px-2" colSpan={2}>סה&quot;כ</td>
                <td className="py-3 px-2">₪{totalPlanned.toLocaleString()}</td>
                <td className="py-3 px-2">₪{stats.budgetUsed.toLocaleString()}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <BudgetFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined); }}
        item={editingItem}
        onSave={(formData) => {
          if (editingItem) {
            updateBudgetItem(editingItem.id, formData);
          } else {
            addBudgetItem(formData);
          }
        }}
      />
    </div>
  );
}
