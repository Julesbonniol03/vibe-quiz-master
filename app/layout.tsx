import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import SplashScreen from "@/components/SplashScreen";
import OnboardingModal from "@/components/OnboardingModal";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationPrompt from "@/components/NotificationPrompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

const APP_URL = "https://vibe-quiz-master.vercel.app";

export const metadata: Metadata = {
  title: "Teubé - Quiz Culture Générale",
  description: "Le quiz des Teubés. 1000+ questions, 17 catégories, 3 modes de jeu. Testez vos connaissances en mode Cyber-Luxe !",
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
    siteName: "Teubé",
    title: "Teubé — L'élite de la Culture G",
    description: "1000+ questions · 17 catégories · 3 modes de jeu. Testez vos connaissances en mode Cyber-Luxe et défiez vos amis !",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Teubé — Quiz Culture Générale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teubé — L'élite de la Culture G",
    description: "1000+ questions · 17 catégories · 3 modes de jeu. Testez vos connaissances en mode Cyber-Luxe !",
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Teubé",
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
        <AuthProvider>
          <SplashScreen />
          <OnboardingModal />
          <Navbar />
          <main className="safe-main pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <NotificationPrompt />
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
