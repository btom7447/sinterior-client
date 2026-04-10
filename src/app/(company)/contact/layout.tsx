import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Sintherior team. Support, partnerships, press, and general inquiries — we respond within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Sintherior",
    description:
      "Reach the Sintherior team for support, partnerships, or general inquiries.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
