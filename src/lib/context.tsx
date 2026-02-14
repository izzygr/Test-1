"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WeddingData, Guest, Table, BudgetItem, Vendor, ChecklistItem } from "@/types";
import { loadData, saveData, getDefaultData } from "./store";
import { v4 as uuidv4 } from "uuid";

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

export function WeddingProvider({ children, currentUserName }: { children: ReactNode; currentUserName?: string }) {
  const [data, setData] = useState<WeddingData>(getDefaultData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveData(data);
    }
  }, [data, loaded]);

  const updateSettings = useCallback((settings: Partial<WeddingData>) => {
    setData((prev) => ({ ...prev, ...settings }));
  }, []);

  // Guest operations
  const addGuest = useCallback((guest: Omit<Guest, "id" | "rsvpLink">) => {
    const id = uuidv4();
    setData((prev) => ({
      ...prev,
      guests: [...prev.guests, { ...guest, id, rsvpLink: id.slice(0, 8), createdBy: currentUserName }],
    }));
  }, [currentUserName]);

  const addGuests = useCallback((guests: Omit<Guest, "id" | "rsvpLink">[]) => {
    const newGuests = guests.map((g) => {
      const id = uuidv4();
      return { ...g, id, rsvpLink: id.slice(0, 8), createdBy: currentUserName };
    });
    setData((prev) => ({
      ...prev,
      guests: [...prev.guests, ...newGuests],
    }));
  }, [currentUserName]);

  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
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
  }, []);

  // Table operations
  const addTable = useCallback((table: Omit<Table, "id" | "guestIds">) => {
    setData((prev) => ({
      ...prev,
      tables: [...prev.tables, { ...table, id: uuidv4(), guestIds: [], createdBy: currentUserName }],
    }));
  }, [currentUserName]);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTable = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.id !== id),
      guests: prev.guests.map((g) => (g.tableId === id ? { ...g, tableId: undefined } : g)),
    }));
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
  }, []);

  // Budget operations
  const addBudgetItem = useCallback((item: Omit<BudgetItem, "id">) => {
    setData((prev) => ({
      ...prev,
      budget: [...prev.budget, { ...item, id: uuidv4(), createdBy: currentUserName }],
    }));
  }, [currentUserName]);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const deleteBudgetItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.filter((b) => b.id !== id),
    }));
  }, []);

  // Vendor operations
  const addVendor = useCallback((vendor: Omit<Vendor, "id">) => {
    setData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, { ...vendor, id: uuidv4(), createdBy: currentUserName }],
    }));
  }, [currentUserName]);

  const updateVendor = useCallback((id: string, updates: Partial<Vendor>) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  }, []);

  const deleteVendor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
    }));
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
  }, []);

  const addChecklistItem = useCallback((item: Omit<ChecklistItem, "id">) => {
    setData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { ...item, id: uuidv4(), createdBy: currentUserName }],
    }));
  }, [currentUserName]);

  const deleteChecklistItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== id),
    }));
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
