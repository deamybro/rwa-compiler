import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./app.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "RWA Compiler — RWA Preflight for X Layer",
  description: "AI-powered RWA Passports and machine-enforceable safety policies for tokenized assets and autonomous agents.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "RWA Compiler — RWA Preflight for X Layer",
    description: "AI interprets. Deterministic systems verify. X Layer enforces.",
    type: "website",
    images: [{ url: "/og.png", width: 1680, height: 945, alt: "RWA Compiler preflight architecture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RWA Compiler — RWA Preflight for X Layer",
    description: "The preflight layer for tokenized assets and AI agents.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
