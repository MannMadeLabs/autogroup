import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GTMScript from "@/components/GTMScript";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Auto Service — Fast, Reliable Car Repair",
  description:
    "Book your auto service online. Oil changes, brakes, AC repair, diagnostics and more. Serving the area since 2010.",
  openGraph: {
    type: "website",
    title: "Auto Service — Fast, Reliable Car Repair",
    description: "Book your auto service online. Get a free estimate in seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? "";
  return (
    <html lang="en" className={inter.className}>
      <head>
        <GTMScript gtmId={gtmId} />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
