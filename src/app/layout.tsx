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
  metadataBase: new URL("https://linksnabio.cc"),
  title: {
    default: "Links na Bio — Crie sua página de links personalizada",
    template: "%s | Links na Bio",
  },
  description:
    "Crie sua página de links em segundos. Reúna todos os seus links, redes sociais e conteúdos em um só lugar e compartilhe com uma única URL.",
  keywords: [
    "link na bio",
    "links na bio",
    "página de links",
    "linktree alternativa",
    "bio link",
    "link in bio",
    "compartilhar links",
    "links personalizados",
    "criador de links",
    "links instagram",
    "links tiktok",
    "links twitter",
    "links facebook",
    "links linkedin",
    "links youtube",
    "página de links personalizada",
    "ferramenta de links",
    "links ilimitados",
    "personalização de links",
    "bio page",
    "link page",
    "social links",
    "all-in-one link",
    "digital business card",
    "online profile",
    "link hub",
    "content sharing",
    "multi-link page",
    "link management",
    "link aggregation",
    "link landing page",
    "social media links",
    "influencer links",
    "creator links",
    "marketing links",
    "personal branding",
    "link optimization",
    "bio link tool",
    "link sharing platform",
    "link page builder",
    "custom link page",
    "link profile",
    "link directory",
  ],
  authors: [{ name: "Links na Bio" }],
  creator: "Links na Bio",
  publisher: "Links na Bio",
  icons: { icon: "/icon.png" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Links na Bio — Crie sua página de links personalizada",
    description:
      "Reúna todos os seus links, redes sociais e conteúdos em um só lugar. Personalize sua página e compartilhe com uma única URL.",
    type: "website",
    url: "https://linksnabio.cc",
    siteName: "Links na Bio",
    locale: "pt_BR",
    images: [
      {
        url: "/banner.jpeg",
        width: 1200,
        height: 630,
        alt: "Links na Bio — Sua página de links personalizada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Links na Bio — Crie sua página de links personalizada",
    description:
      "Reúna todos os seus links, redes sociais e conteúdos em um só lugar. Personalize sua página e compartilhe com uma única URL.",
    images: [
      {
        url: "/banner.jpeg",
        alt: "Links na Bio — Sua página de links personalizada",
      },
    ],
  },
  alternates: {
    canonical: "https://linksnabio.cc",
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
