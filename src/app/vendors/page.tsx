"use client";

import { useWedding } from "@/lib/context";
import { useState } from "react";
import {
  Vendor,
  VendorStatus,
  BudgetCategory,
  BUDGET_CATEGORY_LABELS,
  VENDOR_STATUS_LABELS,
} from "@/types";
import {
  Store,
  Plus,
  Trash2,
  Edit3,
  X,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
} from "lucide-react";

function VendorFormModal({
  open,
  onClose,
  vendor,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor;
  onSave: (data: Omit<Vendor, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Vendor, "id">>({
    name: vendor?.name || "",
    category: vendor?.category || "אולם",
    phone: vendor?.phone || "",
    email: vendor?.email || "",
    price: vendor?.price || 0,
    status: vendor?.status || "בבדיקה",
    notes: vendor?.notes || "",
    paymentDue: vendor?.paymentDue || "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 font-hebrew">
            {vendor ? "עריכת ספק" : "הוספת ספק חדש"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">שם הספק</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="שם העסק / הספק"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">סטטוס</label>
              <select
                className="select-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
              >
                {Object.entries(VENDOR_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">טלפון</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-600 mb-1">מחיר (₪)</label>
              <input
                type="number"
                className="input-field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">תאריך תשלום</label>
              <input
                type="date"
                className="input-field"
                value={form.paymentDue}
                onChange={(e) => setForm({ ...form, paymentDue: e.target.value })}
              />
            </div>
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
          <button className="btn-gold flex-1" onClick={() => { if (!form.name) return; onSave(form); onClose(); }}>
            {vendor ? "עדכן" : "הוסף"}
          </button>
          <button className="btn-outline flex-1" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function statusIcon(status: VendorStatus) {
  switch (status) {
    case "בבדיקה": return <Clock className="w-4 h-4 text-amber-500" />;
    case "נסגר": return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case "שולם": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "בוטל": return <Ban className="w-4 h-4 text-red-500" />;
  }
}

function statusBadge(status: VendorStatus) {
  const colors: Record<VendorStatus, string> = {
    "בבדיקה": "bg-amber-100 text-amber-700",
    "נסגר": "bg-blue-100 text-blue-700",
    "שולם": "bg-green-100 text-green-700",
    "בוטל": "bg-red-100 text-red-700",
  };
  return colors[status];
}

export default function VendorsPage() {
  const { data, addVendor, updateVendor, deleteVendor } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredVendors = filterCategory === "all"
    ? data.vendors
    : data.vendors.filter((v) => v.category === filterCategory);

  const totalCost = data.vendors.filter((v) => v.status !== "בוטל").reduce((sum, v) => sum + v.price, 0);
  const paidTotal = data.vendors.filter((v) => v.status === "שולם").reduce((sum, v) => sum + v.price, 0);

  // Check for upcoming payments
  const upcomingPayments = data.vendors.filter((v) => {
    if (!v.paymentDue || v.status === "שולם" || v.status === "בוטל") return false;
    const due = new Date(v.paymentDue);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14 && diff >= 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <Store className="w-8 h-8 text-gold-500" />
            ניהול ספקים
          </h1>
          <p className="text-gray-500 mt-1">
            {data.vendors.length} ספקים | סה&quot;כ ₪{totalCost.toLocaleString()} | שולם ₪{paidTotal.toLocaleString()}
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setEditingVendor(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          הוספת ספק
        </button>
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">תשלומים קרובים</p>
              {upcomingPayments.map((v) => (
                <p key={v.id} className="text-sm text-amber-700 mt-1">
                  {v.name} - ₪{v.price.toLocaleString()} - עד {new Date(v.paymentDue!).toLocaleDateString("he-IL")}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterCategory === "all" ? "bg-gold-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            הכל
          </button>
          {Object.entries(BUDGET_CATEGORY_LABELS).map(([key, label]) => {
            const hasVendors = data.vendors.some((v) => v.category === key);
            if (!hasVendors && filterCategory !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterCategory === key ? "bg-gold-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full card text-center py-12 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>אין ספקים להצגה. הוסיפו ספק חדש.</p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div key={vendor.id} className="card hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-navy-700 text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-500">{BUDGET_CATEGORY_LABELS[vendor.category]}</p>
                  {vendor.createdBy && (
                    <p className="text-[11px] text-gray-400 mt-0.5">נוסף ע״י {vendor.createdBy}</p>
                  )}
                </div>
                <span className={`badge ${statusBadge(vendor.status)} flex items-center gap-1`}>
                  {statusIcon(vendor.status)}
                  {VENDOR_STATUS_LABELS[vendor.status]}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-2xl font-bold text-gold-700">₪{vendor.price.toLocaleString()}</p>
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{vendor.phone}</span>
                  </a>
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    <span dir="ltr">{vendor.email}</span>
                  </a>
                )}
                {vendor.paymentDue && (
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    תשלום עד: {new Date(vendor.paymentDue).toLocaleDateString("he-IL")}
                  </p>
                )}
                {vendor.notes && (
                  <p className="flex items-start gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                    {vendor.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setEditingVendor(vendor); setShowForm(true); }}
                  className="flex-1 btn-outline py-2 flex items-center justify-center gap-1 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  עריכה
                </button>
                <button
                  onClick={() => { if (confirm(`למחוק את ${vendor.name}?`)) deleteVendor(vendor.id); }}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <VendorFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingVendor(undefined); }}
        vendor={editingVendor}
        onSave={(formData) => {
          if (editingVendor) {
            updateVendor(editingVendor.id, formData);
          } else {
            addVendor(formData);
          }
        }}
      />
    </div>
  );
}
