import type { Metadata } from "next";
import "./globals.css";
import { WeddingProvider } from "@/lib/context";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "חתונתנו - ניהול חתונה חכם",
  description: "אפליקציה מודרנית לתכנון וניהול חתונה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-hebrewSans antialiased">
        <WeddingProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
              <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </WeddingProvider>
      </body>
    </html>
  );
}
