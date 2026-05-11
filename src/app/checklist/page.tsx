"use client";

import { useWedding } from "@/lib/context";
import { useState, useMemo } from "react";
import { ChecklistItem, TaskAssignee } from "@/types";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  Calendar,
  User,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

const ASSIGNEE_LABELS: Record<TaskAssignee, string> = {
  "חתן": "החתן",
  "כלה": "הכלה",
  "הורי_חתן": "הורי החתן",
  "הורי_כלה": "הורי הכלה",
  "משותף": "משותף",
};

const ASSIGNEE_COLORS: Record<TaskAssignee, string> = {
  "חתן": "bg-blue-100 text-blue-700",
  "כלה": "bg-pink-100 text-pink-700",
  "הורי_חתן": "bg-indigo-100 text-indigo-700",
  "הורי_כלה": "bg-purple-100 text-purple-700",
  "משותף": "bg-gold-100 text-gold-700",
};

function getTimeLabel(weeksBefore: number): string {
  if (weeksBefore < 0) return "לאחר החתונה";
  if (weeksBefore === 0) return "יום החתונה";
  if (weeksBefore === 1) return "שבוע לפני";
  if (weeksBefore <= 3) return `${weeksBefore} שבועות לפני`;
  if (weeksBefore <= 4) return "חודש לפני";
  if (weeksBefore <= 8) return "חודשיים לפני";
  if (weeksBefore <= 12) return "3 חודשים לפני";
  if (weeksBefore <= 18) return "4-5 חודשים לפני";
  return "6+ חודשים לפני";
}

const TIME_OPTIONS = [
  { value: 26, label: "6+ חודשים לפני" },
  { value: 24, label: "6 חודשים לפני" },
  { value: 22, label: "5 חודשים לפני" },
  { value: 20, label: "4-5 חודשים לפני" },
  { value: 18, label: "4 חודשים לפני" },
  { value: 14, label: "3 חודשים לפני" },
  { value: 12, label: "3 חודשים לפני" },
  { value: 8, label: "חודשיים לפני" },
  { value: 6, label: "חודש וחצי לפני" },
  { value: 4, label: "חודש לפני" },
  { value: 3, label: "3 שבועות לפני" },
  { value: 1, label: "שבוע לפני" },
  { value: 0, label: "יום החתונה" },
  { value: -1, label: "אחרי החתונה" },
];

function AddTaskModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ChecklistItem, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("כללי");
  const [assignee, setAssignee] = useState<TaskAssignee>("משותף");
  const [dueWeeksBefore, setDueWeeksBefore] = useState(12);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 font-hebrew">הוספת משימה</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">כותרת</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="תיאור המשימה..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">פירוט</label>
            <textarea className="input-field min-h-[60px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">קטגוריה</label>
              <input className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">אחראי</label>
              <select className="select-field" value={assignee} onChange={(e) => setAssignee(e.target.value as TaskAssignee)}>
                {Object.entries(ASSIGNEE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">מתי לבצע</label>
            <select className="select-field" value={dueWeeksBefore} onChange={(e) => setDueWeeksBefore(Number(e.target.value))}>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-gold flex-1" onClick={() => {
            if (!title) return;
            onAdd({ title, description, category, assignee, dueWeeksBefore, completed: false });
            onClose();
            setTitle(""); setDescription("");
          }}>הוסף</button>
          <button className="btn-outline flex-1" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const { data, toggleChecklistItem, addChecklistItem, deleteChecklistItem, stats } = useWedding();
  const [showAdd, setShowAdd] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(data.checklist.map((c) => c.category))).sort(),
    [data.checklist]
  );

  const filteredItems = useMemo(() => {
    return data.checklist.filter((item) => {
      if (!showCompleted && item.completed) return false;
      if (filterAssignee !== "all" && item.assignee !== filterAssignee) return false;
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      return true;
    });
  }, [data.checklist, showCompleted, filterAssignee, filterCategory]);

  // Group by timeline
  const groupedItems = useMemo(() => {
    const groups = new Map<string, ChecklistItem[]>();
    const sortOrder = [26, 24, 22, 20, 18, 14, 12, 8, 6, 4, 3, 1, 0, -1];

    for (const item of filteredItems) {
      const label = getTimeLabel(item.dueWeeksBefore);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(item);
    }

    // Sort groups by timeline
    const sortedEntries = Array.from(groups.entries()).sort((a, b) => {
      const aWeeks = a[1][0]?.dueWeeksBefore || 0;
      const bWeeks = b[1][0]?.dueWeeksBefore || 0;
      return bWeeks - aWeeks;
    });

    return sortedEntries;
  }, [filteredItems]);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const completedPercent = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-gold-500" />
            צ&apos;קליסט משימות
          </h1>
          <p className="text-gray-500 mt-1">
            {stats.completedTasks} מתוך {stats.totalTasks} משימות הושלמו ({completedPercent}%)
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          הוספת משימה
        </button>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">התקדמות כללית</span>
          <span className="text-sm font-bold text-gold-700">{completedPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />

          <select className="select-field w-auto" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="all">כל האחראים</option>
            {Object.entries(ASSIGNEE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select className="select-field w-auto" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">כל הקטגוריות</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gold-300 text-gold-500 focus:ring-gold-500"
            />
            הצג משימות שהושלמו
          </label>
        </div>
      </div>

      {/* Timeline Groups */}
      <div className="space-y-4">
        {groupedItems.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>אין משימות להצגה</p>
          </div>
        ) : (
          groupedItems.map(([label, items]) => {
            const isCollapsed = collapsedSections.has(label);
            const completedInGroup = items.filter((i) => i.completed).length;
            return (
              <div key={label} className="card">
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => toggleSection(label)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gold-500" />
                    <h3 className="text-lg font-bold text-navy-700 font-hebrew">{label}</h3>
                    <span className="text-sm text-gray-400">
                      {completedInGroup}/{items.length}
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                </button>

                {!isCollapsed && (
                  <div className="mt-4 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          item.completed ? "bg-green-50/50 opacity-75" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className="mt-0.5 shrink-0"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-green-500" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gold-500" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.completed ? "line-through text-gray-400" : "text-navy-700"}`}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`badge text-xs ${ASSIGNEE_COLORS[item.assignee]}`}>
                              <User className="w-3 h-3 ml-1" />
                              {ASSIGNEE_LABELS[item.assignee]}
                            </span>
                            <span className="badge text-xs bg-gray-100 text-gray-600">
                              {item.category}
                            </span>
                            {item.createdBy && (
                              <span className="text-[11px] text-gray-400">נוסף ע״י {item.createdBy}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm("למחוק משימה זו?")) deleteChecklistItem(item.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AddTaskModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addChecklistItem} />
    </div>
  );
}
