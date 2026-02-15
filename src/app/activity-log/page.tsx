"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  Users,
  LayoutGrid,
  Wallet,
  Store,
  CheckSquare,
  Settings,
  Filter,
} from "lucide-react";

interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  details?: string;
  username: string;
  createdAt: string;
}

const ACTION_CONFIG: Record<string, { icon: typeof Plus; color: string; bg: string }> = {
  "הוספה": { icon: Plus, color: "text-green-600", bg: "bg-green-50" },
  "עדכון": { icon: Pencil, color: "text-blue-600", bg: "bg-blue-50" },
  "מחיקה": { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
};

const ENTITY_CONFIG: Record<string, { icon: typeof Users; label: string }> = {
  "אורח": { icon: Users, label: "אורח" },
  "שולחן": { icon: LayoutGrid, label: "שולחן" },
  "תקציב": { icon: Wallet, label: "תקציב" },
  "ספק": { icon: Store, label: "ספק" },
  "משימה": { icon: CheckSquare, label: "משימה" },
  "הגדרות": { icon: Settings, label: "הגדרות" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "הרגע";
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;

  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    api
      .get<ActivityLogEntry[]>("/api/activity-log")
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map((l) => l.username)));

  const filtered = logs.filter((l) => {
    if (filterUser !== "all" && l.username !== filterUser) return false;
    if (filterEntity !== "all" && l.entityType !== filterEntity) return false;
    if (filterAction !== "all" && l.action !== filterAction) return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityLogEntry[]>>((acc, log) => {
    const dateKey = new Date(log.createdAt).toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 font-hebrew">יומן פעילות</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} פעולות מתועדות
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
          <Filter className="w-4 h-4" />
          <span>סינון</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="all">כל המשתמשים</option>
            {uniqueUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="all">כל הסוגים</option>
            {Object.entries(ENTITY_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-200"
          >
            <option value="all">כל הפעולות</option>
            <option value="הוספה">הוספה</option>
            <option value="עדכון">עדכון</option>
            <option value="מחיקה">מחיקה</option>
          </select>
        </div>
      </div>

      {/* Log entries grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">אין פעולות עדיין</h3>
          <p className="text-gray-400 text-sm">פעולות שיבוצעו במערכת יופיעו כאן</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, entries]) => (
          <div key={dateLabel} className="space-y-2">
            <h2 className="text-sm font-medium text-gray-400 px-1">{dateLabel}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {entries.map((log) => {
                const actionCfg = ACTION_CONFIG[log.action] || ACTION_CONFIG["עדכון"];
                const entityCfg = ENTITY_CONFIG[log.entityType] || ENTITY_CONFIG["הגדרות"];
                const ActionIcon = actionCfg.icon;
                const EntityIcon = entityCfg.icon;

                return (
                  <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                    {/* Action icon */}
                    <div className={`mt-0.5 p-2 rounded-xl ${actionCfg.bg}`}>
                      <ActionIcon className={`w-4 h-4 ${actionCfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-navy-800 text-sm">{log.username}</span>
                        <span className={`text-sm ${actionCfg.color}`}>{log.action}</span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <EntityIcon className="w-3.5 h-3.5" />
                          <span>{entityCfg.label}:</span>
                        </div>
                        <span className="font-medium text-sm text-navy-700 truncate">{log.entityName}</span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                      )}
                    </div>

                    {/* Time */}
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
