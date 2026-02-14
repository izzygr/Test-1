"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Home,
  Users,
  LayoutGrid,
  Mail,
  Wallet,
  Store,
  CheckSquare,
  Menu,
  X,
  Sparkles,
  Shield,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { href: "/", label: "דשבורד", icon: Home },
  { href: "/guests", label: "אורחים", icon: Users },
  { href: "/seating", label: "סיטינג", icon: LayoutGrid },
  { href: "/rsvp", label: "RSVP", icon: Mail },
  { href: "/budget", label: "תקציב", icon: Wallet },
  { href: "/vendors", label: "ספקים", icon: Store },
  { href: "/checklist", label: "משימות", icon: CheckSquare },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const allNavItems = user?.isAdmin
    ? [...navItems, { href: "/admin", label: "ניהול משתמשים", icon: Shield }]
    : navItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-l border-gray-200 fixed right-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 text-center border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h1 className="text-xl font-bold font-hebrew text-navy-700">
              חתונתנו
            </h1>
          </div>
          <p className="text-xs text-gray-400">ניהול חתונה חכם</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gold-50 text-gold-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-gold-500" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center">
              <User className="w-4 h-4 text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-700 truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <h1 className="text-lg font-bold font-hebrew text-navy-700">חתונתנו</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl pt-16 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 py-4 px-3 space-y-1">
              {allNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gold-50 text-gold-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-gold-500" : "text-gray-400"}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info & Logout */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-700 truncate">{user?.displayName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                התנתק
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
