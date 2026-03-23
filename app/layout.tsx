import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Vibe Quiz Master - Quiz Culture Générale",
  description: "Testez vos connaissances en histoire, sciences, arts et sport avec Vibe Quiz Master",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased bg-[#0f0f1a] text-slate-100 min-h-screen">
        <Navbar />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
