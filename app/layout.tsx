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

const APP_URL = "https://vibe-quiz-master.vercel.app";

export const metadata: Metadata = {
  title: "Vibe Quiz Master - Quiz Culture Générale",
  description: "L'élite de la Culture G en mode Cyber-Luxe. 1000+ questions, 17 catégories, 3 modes de jeu. Testez vos connaissances !",
  manifest: "/manifest.json",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "Vibe Quiz Master",
    title: "Vibe Quiz Master — L'élite de la Culture G",
    description: "1000+ questions · 17 catégories · 3 modes de jeu. Testez vos connaissances en mode Cyber-Luxe et défiez vos amis !",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Vibe Quiz Master — Quiz Culture Générale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Quiz Master — L'élite de la Culture G",
    description: "1000+ questions · 17 catégories · 3 modes de jeu. Testez vos connaissances en mode Cyber-Luxe !",
    images: ["/api/og"],
  },
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
