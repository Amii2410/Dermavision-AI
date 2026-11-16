
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingDermaBot from "./FloatingDermaBot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DermaVision AI | Explainable Skin Lesion Analysis",
  description:
    "An explainable multimodal AI research platform for skin lesion classification using ResNet50, Grad-CAM, and DermaBot.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingDermaBot />
      </body>
    </html>
  );
}
