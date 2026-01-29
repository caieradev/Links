import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Links - Sua página de links personalizada",
  description: "Crie sua página de links em segundos. Compartilhe todos os seus links em um so lugar.",
  keywords: ["linktree", "links", "bio link", "página de links"],
  authors: [{ name: "Links" }],
  openGraph: {
    title: "Links - Sua página de links personalizada",
    description: "Crie sua página de links em segundos. Compartilhe todos os seus links em um so lugar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
