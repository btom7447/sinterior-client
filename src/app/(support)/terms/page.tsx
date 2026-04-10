import type { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing use of Sintherior's marketplace for artisans, suppliers, clients, and real estate listings.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Sintherior ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. These Terms apply to all users, including clients, artisans, suppliers, and visitors.

Sintherior is operated by Sitam Integrated Resource Limited, a company incorporated under the laws of the Federal Republic of Nigeria.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old and capable of entering into a legally binding contract to use Sintherior. By creating an account, you represent and warrant that you meet these requirements. We reserve the right to suspend or terminate accounts that we believe are operated by minors or by persons who have provided false registration information.`,
  },
  {
    title: "3. User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at security@sinterior.ng of any unauthorised use of your account.

You may not share your login credentials, create multiple accounts for the same person, or use another user's account without their explicit permission.`,
  },
  {
    title: "4. Platform Use",
    content: `Sintherior provides a marketplace connecting clients with artisans and suppliers. We do not ourselves provide construction services or manufacture/sell construction materials. All contracts for services or products are entered into directly between the relevant users.

You agree not to use the Platform to:
• Post false, misleading, or fraudulent content
• Harass, abuse, or harm other users
• Circumvent payment processing by arranging off-platform transactions
• Violate any applicable Nigerian law or regulation
• Attempt to gain unauthorised access to the Platform or its systems`,
  },
  {
    title: "5. Payments & Escrow",
    content: `When a client initiates a transaction through Sintherior, funds are held in escrow by our licensed payment partner. Funds are released to the artisan or supplier upon the client's confirmation that work or delivery is satisfactory, or automatically after 7 days if no dispute is raised.

Sintherior charges a service fee on completed transactions. Current fee schedules are available in your account settings and may be updated with 30 days' notice.`,
  },
  {
    title: "6. Verification & Reviews",
    content: `Verification badges indicate that a user has passed our identity checks at the time of verification. Verification does not constitute an endorsement of the user's quality of work or products. Sintherior makes no warranty that verified artisans or suppliers will perform to any particular standard.

Reviews must reflect genuine experiences and may not be incentivised, fabricated, or coerced. We reserve the right to remove reviews that violate our content standards.`,
  },
  {
    title: "7. Intellectual Property",
    content: `All content, design, code, and branding on the Platform are the property of Sitam Integrated Resource Limited or its licensors. You may not copy, reproduce, distribute, or create derivative works without our prior written consent.

By uploading content to Sintherior (including photos, text, and logos), you grant us a non-exclusive, royalty-free, worldwide licence to display that content on the Platform and in our marketing materials.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the fullest extent permitted by Nigerian law, Sintherior and its officers, directors, and employees shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.

Our total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the total fees paid by you to Sintherior in the 12 months preceding the claim.`,
  },
  {
    title: "9. Dispute Resolution",
    content: `We encourage users to resolve disputes amicably through our in-app dispute resolution tool. If a dispute cannot be resolved, both parties agree to submit to the non-exclusive jurisdiction of the courts of Lagos State, Nigeria.`,
  },
  {
    title: "10. Changes to Terms",
    content: `We may update these Terms from time to time. We will notify you of material changes via email and by displaying a notice on the Platform. Continued use of the Platform after the effective date of updated Terms constitutes acceptance of those Terms.`,
  },
  {
    title: "11. Contact",
    content: `Questions about these Terms should be directed to legal@sinterior.ng or by post to:

Sitam Integrated Resource Limited
14 Admiralty Way, Lekki Phase 1
Lagos, Nigeria`,
  },
];

export default function TermsPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <span className="badge-role mb-4 inline-block">Legal</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
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
