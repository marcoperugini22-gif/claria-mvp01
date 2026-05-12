import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Claria – Il tuo profilo finanziario, davvero tuo",
  description:
    "Claria è la piattaforma di financial engagement per le nuove generazioni. " +
    "Educazione finanziaria personalizzata, percorsi di risparmio e consigli che ti capiscono davvero.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF7CE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="bg-claria-cream text-claria-ink">
        <div className="mx-auto min-h-dvh max-w-md">{children}</div>
        <ChatWidget />
      </body>
    </html>
  );
}
