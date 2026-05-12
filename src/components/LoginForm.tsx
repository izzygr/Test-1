"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Sparkles, LogIn, AlertCircle, Loader2 } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("יש למלא שם משתמש וסיסמא");
      return;
    }
    setLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setError("שם משתמש או סיסמא שגויים");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-gold-500" />
              <h1 className="text-3xl font-bold font-hebrew text-navy-700">החתונה</h1>
            </div>
            <p className="text-gray-400 text-sm">ניהול חתונה חכם</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">שם משתמש</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הזינו שם משתמש..."
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">סיסמא</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזינו סיסמא..."
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
