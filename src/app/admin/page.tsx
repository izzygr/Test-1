"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getUsers, addUser, deleteUser, updateUser } from "@/lib/auth-store";
import { AppUser } from "@/types";
import {
  Shield,
  UserPlus,
  Trash2,
  Edit3,
  X,
  Check,
  Users,
  AlertCircle,
} from "lucide-react";

function UserFormModal({
  open,
  onClose,
  editUser,
}: {
  open: boolean;
  onClose: () => void;
  editUser?: AppUser;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editUser) {
      setUsername(editUser.username);
      setPassword("");
      setDisplayName(editUser.displayName);
    } else {
      setUsername("");
      setPassword("");
      setDisplayName("");
    }
    setError("");
  }, [editUser, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (editUser) {
      const updates: Partial<Pick<AppUser, "password" | "displayName">> = {};
      if (displayName && displayName !== editUser.displayName) updates.displayName = displayName;
      if (password) updates.password = password;
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }
      updateUser(editUser.id, updates);
      onClose();
    } else {
      if (!username || !password || !displayName) {
        setError("יש למלא את כל השדות");
        return;
      }
      const result = addUser(username, password, displayName);
      if (!result) {
        setError("שם משתמש כבר קיים");
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 font-hebrew">
            {editUser ? "עריכת משתמש" : "הוספת משתמש חדש"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">שם משתמש</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="שם משתמש..."
              disabled={!!editUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {editUser ? "סיסמא חדשה (השאר ריק לשמור קיימת)" : "סיסמא"}
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמא..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">שם תצוגה</label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="שם מלא..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-gold flex-1 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              {editUser ? "עדכון" : "הוספה"}
            </button>
            <button type="button" className="btn-outline flex-1" onClick={onClose}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refreshUsers = () => setUsers(getUsers());

  useEffect(() => {
    refreshUsers();
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-700 font-hebrew mb-2">אין הרשאה</h1>
          <p className="text-gray-500">עמוד זה זמין למנהלים בלבד</p>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    deleteUser(id);
    setDeleteConfirm(null);
    refreshUsers();
  };

  const handleEdit = (u: AppUser) => {
    setEditingUser(u);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-gold-500" />
          <h1 className="text-3xl font-bold text-navy-700 font-hebrew">ניהול משתמשים</h1>
        </div>
        <button onClick={handleAdd} className="btn-gold flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          משתמש חדש
        </button>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">סה״כ משתמשים</p>
            <p className="text-2xl font-bold text-navy-700">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-right p-4 text-sm font-medium text-gray-500">שם תצוגה</th>
              <th className="text-right p-4 text-sm font-medium text-gray-500">שם משתמש</th>
              <th className="text-right p-4 text-sm font-medium text-gray-500">סוג</th>
              <th className="text-right p-4 text-sm font-medium text-gray-500">תאריך יצירה</th>
              <th className="text-right p-4 text-sm font-medium text-gray-500">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-navy-700">{u.displayName}</td>
                <td className="p-4 text-gray-500">{u.username}</td>
                <td className="p-4">
                  {u.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-50 text-gold-700">
                      <Shield className="w-3 h-3" />
                      מנהל
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      משתמש
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(u.createdAt).toLocaleDateString("he-IL")}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold-600 transition-colors"
                      title="עריכה"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!u.isAdmin && (
                      <>
                        {deleteConfirm === u.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="אישור מחיקה"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                              title="ביטול"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="מחיקה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(undefined);
          refreshUsers();
        }}
        editUser={editingUser}
      />
    </div>
  );
}
