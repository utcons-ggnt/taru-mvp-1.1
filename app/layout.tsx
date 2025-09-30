import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import DataRecoveryUI from "./components/DataRecoveryUI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taru - AI-Powered Educational Platform",
  description: "A comprehensive AI-powered educational platform for personalized learning experiences. Built for students, parents, teachers, and administrators.",
  keywords: "education, AI, learning, personalized, students, teachers, assessment, modules",
  authors: [{ name: "Taru Team" }],
  creator: "Taru",
  publisher: "Taru",
  robots: "index, follow",
  openGraph: {
    title: "Taru - AI-Powered Educational Platform",
    description: "Transform learning with AI-powered personalized education",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taru - AI-Powered Educational Platform",
    description: "Transform learning with AI-powered personalized education",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/logo.svg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6D18CE",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 selection:bg-purple-200 selection:text-purple-900`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <SessionProvider>
            {children}
            <DataRecoveryUI />
            <PerformanceMonitor 
              enabled={true}
              showInDevelopment={true}
            />
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
