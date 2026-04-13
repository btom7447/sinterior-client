import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://sintherior.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Sintherior – Hire Verified Artisans & Buy Building Materials in Nigeria",
    template: "%s | Sintherior",
  },
  description:
    "Find trusted plumbers, electricians, carpenters, painters & more near you. Shop quality building materials from verified Nigerian suppliers — all on one platform.",
  applicationName: "Sintherior",
  keywords: [
    "hire artisan Nigeria",
    "plumber near me Lagos",
    "electrician near me",
    "building materials Nigeria",
    "construction suppliers",
    "interior design Nigeria",
    "carpenter near me",
    "painter near me",
    "home renovation Nigeria",
    "buy cement online",
    "tiles and flooring Nigeria",
    "real estate Nigeria",
    "skilled workers Nigeria",
    "Sintherior",
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
    title:
      "Sintherior – Hire Verified Artisans & Buy Building Materials in Nigeria",
    description:
      "Find trusted plumbers, electricians, carpenters & more near you. Shop quality building materials from verified Nigerian suppliers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sintherior – Verified Artisans & Quality Building Materials in Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sintherior – Hire Verified Artisans & Buy Building Materials in Nigeria",
    description:
      "Find trusted plumbers, electricians, carpenters & more near you. Shop quality building materials from verified Nigerian suppliers.",
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
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "208x208", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "208x208", type: "image/png" }],
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
