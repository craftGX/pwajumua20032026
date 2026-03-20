import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salawat PWA ﷺ",
  description: "Compteur de salawat le vendredi, stats et calendrier.",
  manifest: "/manifest.json", // utile aussi côté Next
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
