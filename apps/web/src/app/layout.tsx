import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { GoogleTagManager } from "@/components/GoogleTagManager";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Apex — Auto service growth",
  description:
    "High-performance landing experience and CRM-lite dashboard for automotive service shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--apex-background)] antialiased text-[color:var(--apex-foreground)]`}
      >
        <GoogleTagManager />
        {children}
      </body>
    </html>
  );
}
