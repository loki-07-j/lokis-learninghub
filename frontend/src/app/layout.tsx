import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Loki's Learning Hub",
  description: "Production-ready AI-assisted technical learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground animate-fade-in">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
