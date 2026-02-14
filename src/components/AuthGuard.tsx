"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { WeddingProvider } from "@/lib/context";
import LoginPage from "@/app/login/page";
import Navigation from "./Navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <WeddingProvider userId={user.id}>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </WeddingProvider>
  );
}
