"use client";

import { useWedding } from "@/lib/context";
import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Wallet,
  CheckSquare,
  CalendarHeart,
  Sparkles,
  Settings,
  Baby,
} from "lucide-react";
import Link from "next/link";

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="flex gap-4 justify-center items-center" dir="ltr">
      {[
        { value: timeLeft.days, label: "ימים" },
        { value: timeLeft.hours, label: "שעות" },
        { value: timeLeft.minutes, label: "דקות" },
        { value: timeLeft.seconds, label: "שניות" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-navy-700 text-white text-3xl md:text-4xl font-bold w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-sm font-hebrew">
            {String(item.value).padStart(2, "0")}
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subValue?: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`card group cursor-pointer hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-md`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-navy-700 font-hebrew">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data, updateSettings } = useWedding();
  const [form, setForm] = useState({
    groomName: data.groomName,
    brideName: data.brideName,
    groomFamily: data.groomFamily,
    brideFamily: data.brideFamily,
    weddingDate: data.weddingDate,
    venue: data.venue,
    totalBudget: data.totalBudget,
  });

  useEffect(() => {
    setForm({
      groomName: data.groomName,
      brideName: data.brideName,
      groomFamily: data.groomFamily,
      brideFamily: data.brideFamily,
      weddingDate: data.weddingDate,
      venue: data.venue,
      totalBudget: data.totalBudget,
    });
  }, [data, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-navy-700 font-hebrew mb-6 text-center">
          הגדרות החתונה
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">שם החתן</label>
              <input
                className="input-field"
                value={form.groomName}
                onChange={(e) => setForm({ ...form, groomName: e.target.value })}
                placeholder="ישראל"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">שם הכלה</label>
              <input
                className="input-field"
                value={form.brideName}
                onChange={(e) => setForm({ ...form, brideName: e.target.value })}
                placeholder="שרה"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">משפחת החתן</label>
              <input
                className="input-field"
                value={form.groomFamily}
                onChange={(e) => setForm({ ...form, groomFamily: e.target.value })}
                placeholder="כהן"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">משפחת הכלה</label>
              <input
                className="input-field"
                value={form.brideFamily}
                onChange={(e) => setForm({ ...form, brideFamily: e.target.value })}
                placeholder="לוי"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">תאריך החתונה</label>
            <input
              type="date"
              className="input-field"
              value={form.weddingDate}
              onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">אולם אירועים</label>
            <input
              className="input-field"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="אולם שמחות..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">תקציב כולל (₪)</label>
            <input
              type="number"
              className="input-field"
              value={form.totalBudget}
              onChange={(e) => setForm({ ...form, totalBudget: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            className="btn-gold flex-1"
            onClick={() => {
              updateSettings(form);
              onClose();
            }}
          >
            שמור
          </button>
          <button className="btn-outline flex-1" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, stats } = useWedding();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasSetup = data.groomName && data.brideName && data.weddingDate;

  const budgetPercent = data.totalBudget > 0 ? Math.round((stats.budgetUsed / data.totalBudget) * 100) : 0;
  const taskPercent = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold font-hebrew text-navy-700">
            חתונתנו
          </h1>
          <Sparkles className="w-7 h-7 text-gold-500" />
        </div>

        {hasSetup ? (
          <>
            <p className="text-xl text-gray-600 font-hebrew font-medium">
              {data.groomName} {data.groomFamily && `(${data.groomFamily})`}
              {" & "}
              {data.brideName} {data.brideFamily && `(${data.brideFamily})`}
            </p>
            {data.venue && (
              <p className="text-gray-500 mt-1">
                {data.venue}
              </p>
            )}
          </>
        ) : (
          <p className="text-lg text-gray-500">ברוכים הבאים! הגדירו את פרטי החתונה להתחלה</p>
        )}

        <button
          onClick={() => setSettingsOpen(true)}
          className="mt-4 inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          הגדרות
        </button>
      </div>

      {/* Countdown */}
      {data.weddingDate && (
        <div className="card text-center py-8">
          <h2 className="text-xl font-bold text-navy-700 font-hebrew mb-6 flex items-center justify-center gap-2">
            <CalendarHeart className="w-5 h-5 text-gold-500" />
            ספירה לאחור ליום המאושר
          </h2>
          <CountdownTimer targetDate={data.weddingDate} />
          <p className="text-sm text-gray-500 mt-4">
            {new Date(data.weddingDate).toLocaleDateString("he-IL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="סה״כ מוזמנים"
          value={stats.totalGuests}
          subValue={`${data.guests.length} משפחות`}
          color="bg-blue-500"
          href="/guests"
        />
        <StatCard
          icon={UserCheck}
          label="אישרו הגעה"
          value={stats.confirmedGuests}
          subValue={stats.totalGuests > 0 ? `${Math.round((stats.confirmedGuests / stats.totalGuests) * 100)}%` : ""}
          color="bg-green-500"
          href="/guests"
        />
        <StatCard
          icon={UserX}
          label="סירבו"
          value={stats.declinedGuests}
          color="bg-red-400"
          href="/guests"
        />
        <StatCard
          icon={Clock}
          label="ממתינים"
          value={stats.pendingGuests}
          color="bg-amber-500"
          href="/guests"
        />
        <StatCard
          icon={Baby}
          label="ילדים"
          value={stats.totalChildren}
          color="bg-purple-400"
          href="/guests"
        />
        <StatCard
          icon={Users}
          label="גברים / נשים"
          value={`${stats.maleGuests} / ${stats.femaleGuests}`}
          color="bg-indigo-500"
          href="/guests"
        />
        <StatCard
          icon={Wallet}
          label="תקציב נוצל"
          value={`₪${stats.budgetUsed.toLocaleString()}`}
          subValue={`${budgetPercent}% מתוך ₪${data.totalBudget.toLocaleString()}`}
          color={budgetPercent > 90 ? "bg-red-500" : "bg-emerald-500"}
          href="/budget"
        />
        <StatCard
          icon={CheckSquare}
          label="משימות הושלמו"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          subValue={`${taskPercent}%`}
          color="bg-teal-500"
          href="/checklist"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-navy-700 font-hebrew mb-4">גישה מהירה</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/guests", label: "הוספת אורחים", icon: Users, color: "text-blue-600 bg-blue-50" },
            { href: "/seating", label: "סידור שולחנות", icon: LayoutGrid, color: "text-purple-600 bg-purple-50" },
            { href: "/rsvp", label: "שליחת הזמנות", icon: Mail, color: "text-green-600 bg-green-50" },
            { href: "/budget", label: "ניהול תקציב", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
            { href: "/vendors", label: "ניהול ספקים", icon: Store, color: "text-orange-600 bg-orange-50" },
            { href: "/checklist", label: "צ׳קליסט", icon: CheckSquare, color: "text-teal-600 bg-teal-50" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${item.color} hover:scale-105 transition-transform`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

// Need these imports for the quick actions
import { LayoutGrid, Mail, Store } from "lucide-react";
