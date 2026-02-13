"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Heart,
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-navy-500 via-navy-600 to-navy-700 text-white shadow-2xl fixed right-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 text-center border-b border-white/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-gold-400 fill-gold-400" />
            <h1 className="text-2xl font-bold font-hebrew text-gold-300">
              שמחת חתן וכלה
            </h1>
            <Heart className="w-6 h-6 text-gold-400 fill-gold-400" />
          </div>
          <p className="text-xs text-gold-200/70 font-hebrew">ניהול חתונה חרדית</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gold-500/20 text-gold-300 shadow-lg shadow-gold-500/10"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-gold-400" : "text-white/50 group-hover:text-gold-300"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">✡ בסימן טוב ומזל טוב ✡</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-navy-500 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-gold-400 fill-gold-400" />
            <h1 className="text-lg font-bold font-hebrew text-gold-300">שמחת חתן וכלה</h1>
            <Heart className="w-5 h-5 text-gold-400 fill-gold-400" />
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-gradient-to-b from-navy-500 via-navy-600 to-navy-700 shadow-2xl pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gold-500/20 text-gold-300"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-gold-400" : "text-white/50"}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
