"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WeddingData, Guest, Table, BudgetItem, Vendor, ChecklistItem } from "@/types";
import { getDefaultData } from "./store";
import { api } from "./api";

interface WeddingContextType {
  data: WeddingData;
  setData: React.Dispatch<React.SetStateAction<WeddingData>>;
  updateSettings: (settings: Partial<WeddingData>) => void;
  // Guests
  addGuest: (guest: Omit<Guest, "id" | "rsvpLink">) => void;
  addGuests: (guests: Omit<Guest, "id" | "rsvpLink">[]) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  // Tables
  addTable: (table: Omit<Table, "id" | "guestIds">) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  assignGuestToTable: (guestId: string, tableId: string) => void;
  removeGuestFromTable: (guestId: string) => void;
  // Budget
  addBudgetItem: (item: Omit<BudgetItem, "id">) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  // Vendors
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  // Checklist
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, "id">) => void;
  deleteChecklistItem: (id: string) => void;
  // Stats
  stats: {
    totalGuests: number;
    confirmedGuests: number;
    declinedGuests: number;
    pendingGuests: number;
    totalChildren: number;
    maleGuests: number;
    femaleGuests: number;
    budgetUsed: number;
    budgetRemaining: number;
    completedTasks: number;
    totalTasks: number;
  };
}

const WeddingContext = createContext<WeddingContextType | null>(null);

interface SettingsResponse {
  weddingDate?: string;
  groomName?: string;
  brideName?: string;
  groomFamily?: string;
  brideFamily?: string;
  venue?: string;
  totalBudget?: number;
  language?: string;
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeddingData>(getDefaultData());
  const [loaded, setLoaded] = useState(false);

  // Load all data from API on mount
  useEffect(() => {
    async function loadFromApi() {
      try {
        const [settings, guests, tables, budget, vendors, checklist] = await Promise.all([
          api.get<SettingsResponse>("/api/settings").catch((): SettingsResponse => ({})),
          api.get<Guest[]>("/api/guests").catch(() => []),
          api.get<Table[]>("/api/tables").catch(() => []),
          api.get<BudgetItem[]>("/api/budget").catch(() => []),
          api.get<Vendor[]>("/api/vendors").catch(() => []),
          api.get<ChecklistItem[]>("/api/checklist").catch(() => []),
        ]);

        const defaults = getDefaultData();
        setData({
          weddingDate: settings.weddingDate || defaults.weddingDate,
          groomName: settings.groomName || defaults.groomName,
          brideName: settings.brideName || defaults.brideName,
          groomFamily: settings.groomFamily || defaults.groomFamily,
          brideFamily: settings.brideFamily || defaults.brideFamily,
          venue: settings.venue || defaults.venue,
          totalBudget: settings.totalBudget ?? defaults.totalBudget,
          language: (settings.language as "he" | "en") || defaults.language,
          guests: guests as Guest[],
          tables: tables as Table[],
          budget: budget as BudgetItem[],
          vendors: vendors as Vendor[],
          checklist: (checklist as ChecklistItem[]).length > 0 ? (checklist as ChecklistItem[]) : defaults.checklist,
        });
      } catch {
        // Fall back to defaults on error
      }
      setLoaded(true);
    }
    loadFromApi();
  }, []);

  const updateSettings = useCallback((settings: Partial<WeddingData>) => {
    setData((prev) => ({ ...prev, ...settings }));
    // Persist settings fields to API
    const { guests, tables, budget, vendors, checklist, ...settingsOnly } = settings as Record<string, unknown>;
    void guests; void tables; void budget; void vendors; void checklist;
    if (Object.keys(settingsOnly).length > 0) {
      api.put("/api/settings", settingsOnly).catch(() => {});
    }
  }, []);

  // Guest operations
  const addGuest = useCallback((guest: Omit<Guest, "id" | "rsvpLink">) => {
    api.post<Guest>("/api/guests", guest).then((created) => {
      setData((prev) => ({
        ...prev,
        guests: [...prev.guests, created],
      }));
    }).catch(() => {});
  }, []);

  const addGuests = useCallback((guests: Omit<Guest, "id" | "rsvpLink">[]) => {
    api.post<Guest[]>("/api/guests", guests).then((created) => {
      setData((prev) => ({
        ...prev,
        guests: [...prev.guests, ...created],
      }));
    }).catch(() => {});
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    api.put("/api/guests", { id, ...updates }).catch(() => {});
  }, []);

  const deleteGuest = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.id !== id),
      tables: prev.tables.map((t) => ({
        ...t,
        guestIds: t.guestIds.filter((gId) => gId !== id),
      })),
    }));
    api.delete("/api/guests", { id }).catch(() => {});
  }, []);

  // Table operations
  const addTable = useCallback((table: Omit<Table, "id" | "guestIds">) => {
    api.post<Table>("/api/tables", table).then((created) => {
      setData((prev) => ({
        ...prev,
        tables: [...prev.tables, created],
      }));
    }).catch(() => {});
  }, []);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    api.put("/api/tables", { id, ...updates }).catch(() => {});
  }, []);

  const deleteTable = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.id !== id),
      guests: prev.guests.map((g) => (g.tableId === id ? { ...g, tableId: undefined } : g)),
    }));
    api.delete("/api/tables", { id }).catch(() => {});
  }, []);

  const assignGuestToTable = useCallback((guestId: string, tableId: string) => {
    setData((prev) => {
      const newTables = prev.tables.map((t) => ({
        ...t,
        guestIds: t.id === tableId
          ? [...t.guestIds.filter((id) => id !== guestId), guestId]
          : t.guestIds.filter((id) => id !== guestId),
      }));
      const newGuests = prev.guests.map((g) =>
        g.id === guestId ? { ...g, tableId } : g
      );
      return { ...prev, tables: newTables, guests: newGuests };
    });
    // Update guest's tableId on the server
    api.put("/api/guests", { id: guestId, tableId }).catch(() => {});
  }, []);

  const removeGuestFromTable = useCallback((guestId: string) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => ({
        ...t,
        guestIds: t.guestIds.filter((id) => id !== guestId),
      })),
      guests: prev.guests.map((g) =>
        g.id === guestId ? { ...g, tableId: undefined } : g
      ),
    }));
    api.put("/api/guests", { id: guestId, tableId: null }).catch(() => {});
  }, []);

  // Budget operations
  const addBudgetItem = useCallback((item: Omit<BudgetItem, "id">) => {
    api.post<BudgetItem>("/api/budget", item).then((created) => {
      setData((prev) => ({
        ...prev,
        budget: [...prev.budget, created],
      }));
    }).catch(() => {});
  }, []);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
    api.put("/api/budget", { id, ...updates }).catch(() => {});
  }, []);

  const deleteBudgetItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.filter((b) => b.id !== id),
    }));
    api.delete("/api/budget", { id }).catch(() => {});
  }, []);

  // Vendor operations
  const addVendor = useCallback((vendor: Omit<Vendor, "id">) => {
    api.post<Vendor>("/api/vendors", vendor).then((created) => {
      setData((prev) => ({
        ...prev,
        vendors: [...prev.vendors, created],
      }));
    }).catch(() => {});
  }, []);

  const updateVendor = useCallback((id: string, updates: Partial<Vendor>) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
    api.put("/api/vendors", { id, ...updates }).catch(() => {});
  }, []);

  const deleteVendor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
    }));
    api.delete("/api/vendors", { id }).catch(() => {});
  }, []);

  // Checklist operations
  const toggleChecklistItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) =>
        c.id === id
          ? { ...c, completed: !c.completed, completedAt: !c.completed ? new Date().toISOString() : undefined }
          : c
      ),
    }));
    api.put("/api/checklist", { id, toggle: true }).catch(() => {});
  }, []);

  const addChecklistItem = useCallback((item: Omit<ChecklistItem, "id">) => {
    api.post<ChecklistItem>("/api/checklist", item).then((created) => {
      setData((prev) => ({
        ...prev,
        checklist: [...prev.checklist, created],
      }));
    }).catch(() => {});
  }, []);

  const deleteChecklistItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== id),
    }));
    api.delete("/api/checklist", { id }).catch(() => {});
  }, []);

  // Computed stats
  const stats = React.useMemo(() => {
    const confirmedGuests = data.guests.filter((g) => g.status === "אישר");
    const totalActualBudget = data.budget.reduce((sum, b) => sum + b.actual, 0);
    return {
      totalGuests: data.guests.reduce((sum, g) => sum + g.numberOfGuests, 0),
      confirmedGuests: confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0),
      declinedGuests: data.guests.filter((g) => g.status === "סירב").reduce((sum, g) => sum + g.numberOfGuests, 0),
      pendingGuests: data.guests.filter((g) => g.status !== "אישר" && g.status !== "סירב").reduce((sum, g) => sum + g.numberOfGuests, 0),
      totalChildren: data.guests.reduce((sum, g) => sum + g.numberOfChildren, 0),
      maleGuests: data.guests.filter((g) => g.gender === "male").reduce((sum, g) => sum + g.numberOfGuests, 0),
      femaleGuests: data.guests.filter((g) => g.gender === "female").reduce((sum, g) => sum + g.numberOfGuests, 0),
      budgetUsed: totalActualBudget,
      budgetRemaining: data.totalBudget - totalActualBudget,
      completedTasks: data.checklist.filter((c) => c.completed).length,
      totalTasks: data.checklist.length,
    };
  }, [data.guests, data.budget, data.totalBudget, data.checklist]);

  if (!loaded) {
    return null;
  }

  return (
    <WeddingContext.Provider
      value={{
        data, setData, updateSettings,
        addGuest, addGuests, updateGuest, deleteGuest,
        addTable, updateTable, deleteTable, assignGuestToTable, removeGuestFromTable,
        addBudgetItem, updateBudgetItem, deleteBudgetItem,
        addVendor, updateVendor, deleteVendor,
        toggleChecklistItem, addChecklistItem, deleteChecklistItem,
        stats,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used within WeddingProvider");
  return ctx;
}
