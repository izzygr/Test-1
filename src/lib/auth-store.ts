"use client";

import { AppUser } from "@/types";
import { api, getToken, setToken, clearToken } from "./api";

export async function authenticate(
  username: string,
  password: string
): Promise<AppUser | null> {
  try {
    const res = await api.post<{
      token: string;
      user: { id: string; username: string; displayName: string; isAdmin: boolean };
    }>("/api/auth/login", { username, password });
    setToken(res.token);
    return {
      id: res.user.id,
      username: res.user.username,
      displayName: res.user.displayName,
      isAdmin: res.user.isAdmin,
      password: "",
      createdAt: "",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AppUser | null> {
  if (!getToken()) return null;
  try {
    const res = await api.get<{
      user: { id: string; username: string; displayName: string; isAdmin: boolean; createdAt: string };
    }>("/api/auth/me");
    return {
      id: res.user.id,
      username: res.user.username,
      displayName: res.user.displayName,
      isAdmin: res.user.isAdmin,
      password: "",
      createdAt: res.user.createdAt,
    };
  } catch {
    clearToken();
    return null;
  }
}

export function clearSession(): void {
  clearToken();
}

// Admin user management - all via API
export async function getUsers(): Promise<Omit<AppUser, "password">[]> {
  try {
    return await api.get<Omit<AppUser, "password">[]>("/api/users");
  } catch {
    return [];
  }
}

export async function addUser(
  username: string,
  password: string,
  displayName: string
): Promise<Omit<AppUser, "password"> | null> {
  try {
    return await api.post<Omit<AppUser, "password">>("/api/users", {
      username,
      password,
      displayName,
    });
  } catch {
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await api.delete("/api/users", { id });
    return true;
  } catch {
    return false;
  }
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<AppUser, "password" | "displayName">>
): Promise<boolean> {
  try {
    await api.put("/api/users", { id, ...updates });
    return true;
  } catch {
    return false;
  }
}
