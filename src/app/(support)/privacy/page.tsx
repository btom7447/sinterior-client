import type { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sintherior collects, uses, and protects your personal data. Compliant with the Nigeria Data Protection Act 2023 and GDPR where applicable.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Introduction",
    content: `Sitam Integrated Resource Limited ("Sintherior", "we", "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights with respect to it.

By using the Sintherior platform, you agree to the collection and use of information as described in this policy. We comply with the Nigeria Data Protection Act 2023 (NDPA) and, where applicable, the EU General Data Protection Regulation (GDPR).`,
  },
  {
    title: "2. Data We Collect",
    content: `We collect information you provide directly:
• Account information — name, email address, phone number, password
• Profile information — biography, skills, location, profile photo
• Identity documents — for verification purposes (artisans and suppliers)
• Payment information — card details processed by our PCI-compliant payment provider (we do not store raw card data)
• Communications — messages sent through the platform, support requests

We also collect information automatically:
• Device and browser information
• IP address and approximate location
• Pages visited and features used
• Referring URLs`,
  },
  {
    title: "3. How We Use Your Data",
    content: `We use your personal data to:
• Create and manage your account
• Facilitate transactions between users
• Verify artisan and supplier identities
• Send service notifications (booking confirmations, payment receipts, etc.)
• Send marketing communications (you can opt out at any time)
• Detect and prevent fraud and abuse
• Improve the Platform through analytics
• Comply with legal obligations`,
  },
  {
    title: "4. Sharing Your Data",
    content: `We do not sell your personal data. We share data only in the following circumstances:

With other platform users: Your public profile information (name, photo, reviews, location) is visible to other users as necessary to facilitate transactions.

With service providers: We use trusted third-party providers for payment processing, cloud hosting, email delivery, and analytics. These providers are contractually bound to process data only as instructed.

For legal compliance: We may disclose data when required by law, court order, or to protect the rights, property, or safety of Sintherior, its users, or the public.

Business transfers: In the event of a merger or acquisition, your data may be transferred to the successor entity with appropriate notice.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your account data for as long as your account is active. If you delete your account, we will erase your personal data within 30 days, except where we are required by law to retain it for longer (e.g. transaction records for tax purposes, which we retain for 7 years).

Anonymised, aggregated data derived from your usage may be retained indefinitely for platform improvement.`,
  },
  {
    title: "6. Your Rights",
    content: `Under the NDPA and where applicable the GDPR, you have the right to:
• Access the personal data we hold about you
• Correct inaccurate data
• Request erasure ("right to be forgotten")
• Object to or restrict how we process your data
• Data portability — receive a machine-readable copy of your data
• Withdraw consent at any time (where processing is based on consent)

To exercise any of these rights, email privacy@sinterior.ng. We will respond within 30 days.`,
  },
  {
    title: "7. Cookies",
    content: `We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how the Platform is used.

Essential cookies are always active. Analytics and marketing cookies can be managed through your browser settings or our cookie preference centre (accessible via the "Cookie Settings" link in the footer).`,
  },
  {
    title: "8. Security",
    content: `We implement industry-standard technical and organisational measures to protect your data, including TLS encryption in transit, AES-256 encryption at rest for sensitive fields, and regular third-party security audits.

No system is completely secure. If you believe your account has been compromised, contact us immediately at security@sinterior.ng.`,
  },
  {
    title: "9. Children",
    content: `Sintherior is not directed at children under 18. We do not knowingly collect personal data from minors. If we become aware that a minor has created an account, we will delete it and all associated data promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify you of material changes by email and via an in-app notice at least 14 days before the changes take effect.`,
  },
  {
    title: "11. Contact & Complaints",
    content: `For privacy questions, contact our Data Protection Officer at privacy@sinterior.ng.

If you are unsatisfied with our response, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpb.gov.ng.`,
  },
];

export default function PrivacyPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <span className="badge-role mb-4 inline-block">Legal</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: 1 March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
                <nav className="flex flex-col gap-1">
                  {sections.map((s) => (
                    <a
                      key={s.title}
                      href={`#${s.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3 flex flex-col gap-10">
              {sections.map((s) => (
                <div
                  key={s.title}
                  id={s.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{s.content}</p>
                </div>
              ))}

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  For questions, see our{" "}
                  <Link href="/help" className="text-primary hover:underline">Help Center</Link> or{" "}
                  <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
