import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import SplashScreen from "@/components/SplashScreen";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: "Vibe Quiz Master - Quiz Culture Générale",
  description: "Testez vos connaissances en histoire, sciences, arts et sport avec Vibe Quiz Master",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vibe Quiz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased bg-cyber-950 text-slate-100 min-h-screen">
        <SplashScreen />
        <Navbar />
        <main className="safe-main">{children}</main>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
