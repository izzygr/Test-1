"use client";

import { useWedding } from "@/lib/context";
import { useState, useMemo } from "react";
import { Table, Guest } from "@/types";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  X,
  Printer,
} from "lucide-react";

function TableCard({
  table,
  guests,
  allGuests,
  onAssign,
  onRemove,
  onDelete,
}: {
  table: Table;
  guests: Guest[];
  allGuests: Guest[];
  onAssign: (guestId: string, tableId: string) => void;
  onRemove: (guestId: string) => void;
  onDelete: (tableId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const occupancy = guests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const isFull = occupancy >= table.capacity;
  const isOverflow = occupancy > table.capacity;

  const unassignedGuests = allGuests.filter(
    (g) =>
      !g.tableId &&
      ((table.section === "גברים" && g.gender === "male") ||
        (table.section === "נשים" && g.gender === "female"))
  );

  const typeColors: Record<string, string> = {
    "כבוד": "border-gold-400 bg-gold-50",
    "רבנים": "border-purple-400 bg-purple-50",
    "משפחה": "border-blue-400 bg-blue-50",
    "רגיל": "border-gray-300 bg-white",
  };

  return (
    <div className={`rounded-2xl border-2 ${typeColors[table.type] || typeColors["רגיל"]} p-4 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-navy-700 text-sm">{table.name}</h4>
          {isOverflow && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isFull ? (isOverflow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700") : "bg-gray-100 text-gray-600"
          }`}>
            {occupancy}/{table.capacity}
          </span>
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-white/50 rounded">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {guests.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">שולחן ריק</p>
          ) : (
            guests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1.5 text-sm">
                <span>{guest.firstName} {guest.lastName} ({guest.numberOfGuests})</span>
                <button
                  onClick={() => onRemove(guest.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}

          <div className="flex gap-1 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="flex-1 text-xs btn-outline py-1.5 flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              הוספת אורח
            </button>
            <button
              onClick={() => {
                if (confirm(`למחוק את ${table.name}?`)) onDelete(table.id);
              }}
              className="text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {showAssign && (
            <div className="bg-white rounded-xl border border-gold-200 p-2 max-h-40 overflow-y-auto">
              {unassignedGuests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">אין אורחים ללא שולחן</p>
              ) : (
                unassignedGuests.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { onAssign(g.id, table.id); }}
                    className="w-full text-right text-xs px-2 py-1.5 hover:bg-gold-50 rounded transition-colors"
                  >
                    {g.firstName} {g.lastName} ({g.numberOfGuests})
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddTableModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (table: Omit<Table, "id" | "guestIds">) => void;
}) {
  const [name, setName] = useState("");
  const [section, setSection] = useState<"גברים" | "נשים">("גברים");
  const [type, setType] = useState<"כבוד" | "רבנים" | "משפחה" | "רגיל">("רגיל");
  const [capacity, setCapacity] = useState(10);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-navy-700 font-hebrew mb-6">הוספת שולחן חדש</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">שם השולחן</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="שולחן..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">אזור</label>
              <select className="select-field" value={section} onChange={(e) => setSection(e.target.value as typeof section)}>
                <option value="גברים">צד גברים</option>
                <option value="נשים">צד נשים</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">סוג</label>
              <select className="select-field" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="כבוד">שולחן כבוד</option>
                <option value="רבנים">שולחן רבנים</option>
                <option value="משפחה">שולחן משפחה</option>
                <option value="רגיל">שולחן רגיל</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">מספר מקומות</label>
            <input type="number" min="4" max="20" className="input-field" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-gold flex-1" onClick={() => { if (!name) return; onAdd({ name, section, type, capacity, x: 50, y: 50 }); onClose(); setName(""); }}>
            הוסף
          </button>
          <button className="btn-outline flex-1" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

export default function SeatingPage() {
  const { data, addTable, deleteTable, assignGuestToTable, removeGuestFromTable } = useWedding();
  const [activeSection, setActiveSection] = useState<"גברים" | "נשים">("גברים");
  const [showAddTable, setShowAddTable] = useState(false);

  const sectionTables = useMemo(
    () => data.tables.filter((t) => t.section === activeSection),
    [data.tables, activeSection]
  );

  const unassignedGuests = useMemo(
    () => data.guests.filter((g) => !g.tableId),
    [data.guests]
  );

  const unassignedMen = unassignedGuests.filter((g) => g.gender === "male");
  const unassignedWomen = unassignedGuests.filter((g) => g.gender === "female");

  const getTableGuests = (table: Table) =>
    data.guests.filter((g) => table.guestIds.includes(g.id));

  const totalSeated = data.guests.filter((g) => g.tableId).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-gold-500" />
            סידור שולחנות
          </h1>
          <p className="text-gray-500 mt-1">
            {totalSeated} מתוך {data.guests.length} משפחות שובצו לשולחנות
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-gold flex items-center gap-2" onClick={() => setShowAddTable(true)}>
            <Plus className="w-4 h-4" />
            הוספת שולחן
          </button>
          <button className="btn-outline flex items-center gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            הדפסה
          </button>
        </div>
      </div>

      {/* Alerts */}
      {unassignedGuests.length > 0 && (
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{unassignedGuests.length} משפחות</strong> ללא שולחן
              ({unassignedMen.length} גברים, {unassignedWomen.length} נשים)
            </p>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2">
        {(["גברים", "נשים"] as const).map((section) => {
          const isActive = activeSection === section;
          const tables = data.tables.filter((t) => t.section === section);
          const seated = tables.reduce((sum, t) => sum + t.guestIds.length, 0);
          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                isActive
                  ? section === "גברים"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-pink-500 text-white shadow-lg"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{section === "גברים" ? "צד גברים" : "צד נשים"}</span>
              <span className="block text-sm font-normal mt-1 opacity-80">
                {tables.length} שולחנות | {seated} משפחות
              </span>
            </button>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sectionTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            guests={getTableGuests(table)}
            allGuests={data.guests}
            onAssign={assignGuestToTable}
            onRemove={removeGuestFromTable}
            onDelete={deleteTable}
          />
        ))}
      </div>

      {sectionTables.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>אין שולחנות באזור זה. הוסיפו שולחן חדש.</p>
        </div>
      )}

      {/* Unassigned Guests List */}
      {unassignedGuests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-navy-700 font-hebrew mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            אורחים ללא שולחן ({activeSection === "גברים" ? unassignedMen.length : unassignedWomen.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(activeSection === "גברים" ? unassignedMen : unassignedWomen).map((guest) => (
              <div key={guest.id} className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm">
                <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                <span className="text-gray-500 mr-1">({guest.numberOfGuests})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddTableModal open={showAddTable} onClose={() => setShowAddTable(false)} onAdd={addTable} />
    </div>
  );
}
