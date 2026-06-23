import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ShopProvider } from "../context/ShopContext";
import { ToastProvider } from "../context/ToastContext";
import { LanguageProvider } from "../context/LanguageContext";
import LanguageSync from "./components/language/LanguageSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexaTech",
  description: "Toko teknologi NexaTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="id" suppressHydrationWarning>
          <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
              <LanguageProvider>
                  <AuthProvider>
                      <ShopProvider>
                          <ToastProvider>
                              <LanguageSync>{children}</LanguageSync>
                          </ToastProvider>
                      </ShopProvider>
                  </AuthProvider>
              </LanguageProvider>
          </body>
      </html>
  );
}
