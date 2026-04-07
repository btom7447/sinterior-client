import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://sintherior.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sintherior – Build Better with Trusted Artisans & Quality Materials",
    template: "%s | Sintherior",
  },
  description:
    "Connect with verified construction professionals, premium suppliers, and everything you need to bring your building projects to life across Nigeria.",
  applicationName: "Sintherior",
  keywords: [
    "artisans",
    "construction",
    "interior design",
    "suppliers",
    "building materials",
    "real estate",
    "Nigeria",
    "skilled workers",
    "home improvement",
    "contractors",
    "carpenters",
    "plumbers",
    "electricians",
    "masonry",
    "painters",
  ],
  authors: [{ name: "Sintherior" }],
  creator: "Sintherior",
  publisher: "Sintherior",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "Sintherior",
    title: "Sintherior – Build Better with Trusted Artisans & Quality Materials",
    description:
      "Connect with verified construction professionals, premium suppliers, and everything you need to bring your building projects to life across Nigeria.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sintherior – Trusted Artisans & Quality Materials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sintherior – Build Better with Trusted Artisans & Quality Materials",
    description:
      "Verified artisans, premium suppliers, and quality materials for your construction projects across Nigeria.",
    images: ["/og-image.png"],
    creator: "@sintherior",
  },
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  category: "business",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
