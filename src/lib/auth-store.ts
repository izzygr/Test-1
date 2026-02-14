"use client";

import { AppUser } from "@/types";
import { v4 as uuidv4 } from "uuid";

const USERS_KEY = "hatunateinu-users";
const SESSION_KEY = "hatunateinu-session";

const DEFAULT_ADMIN: AppUser = {
  id: "admin-001",
  username: "Yisrael",
  password: "1234",
  displayName: "ישראל (אדמין)",
  isAdmin: true,
  createdAt: new Date().toISOString(),
};

export function getUsers(): AppUser[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      const users: AppUser[] = JSON.parse(stored);
      // Ensure admin always exists
      if (!users.find((u) => u.username === "Yisrael" && u.isAdmin)) {
        users.unshift(DEFAULT_ADMIN);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      return users;
    }
  } catch {
    // ignore
  }
  // First time - initialize with admin
  const users = [DEFAULT_ADMIN];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

export function saveUsers(users: AppUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function addUser(username: string, password: string, displayName: string): AppUser | null {
  const users = getUsers();
  if (users.find((u) => u.username === username)) return null;
  const newUser: AppUser = {
    id: uuidv4(),
    username,
    password,
    displayName,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const user = users.find((u) => u.id === id);
  if (!user || user.isAdmin) return false; // Can't delete admin
  saveUsers(users.filter((u) => u.id !== id));
  return true;
}

export function updateUser(id: string, updates: Partial<Pick<AppUser, "password" | "displayName">>): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return true;
}

export function authenticate(username: string, password: string): AppUser | null {
  const users = getUsers();
  return users.find((u) => u.username === username && u.password === password) || null;
}

export function getSession(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      // Verify user still exists
      const users = getUsers();
      return users.find((u) => u.id === session.id) || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setSession(user: AppUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, username: user.username }));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
