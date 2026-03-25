import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "Sinterior – Build Better with Trusted Artisans & Quality Materials",
  description:
    "Connect with verified construction professionals, premium suppliers, and everything you need to bring your building projects to life across Nigeria.",
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