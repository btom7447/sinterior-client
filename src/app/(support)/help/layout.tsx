import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Answers to common questions about booking artisans, ordering materials, payments, and account management on Sintherior.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Sintherior Help Center",
    description:
      "Guides and answers for clients, artisans, and suppliers using Sintherior.",
    url: "/help",
    type: "website",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
