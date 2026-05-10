import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mann Auto Group",
  description: "Automotive service — Project Apex public site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
