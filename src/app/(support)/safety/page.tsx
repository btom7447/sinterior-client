import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Eye, Phone, FileText, Users } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Verified Identities",
    description:
      "Every artisan and supplier must submit government-issued ID before their listing goes live. We cross-check against publicly available records where possible.",
  },
  {
    icon: Eye,
    title: "Transparent Reviews",
    description:
      "Reviews can only be left by users who have completed a real transaction. We don't allow brands or artisans to pay for or remove legitimate reviews.",
  },
  {
    icon: Users,
    title: "Community Reporting",
    description:
      "Any user can flag a profile, listing, or message that seems suspicious. Our moderation team reviews all reports within 24 hours.",
  },
  {
    icon: FileText,
    title: "Escrow Payments",
    description:
      "When you pay through Sintherior, your money is held in escrow until you confirm the work or delivery is satisfactory. We never release funds prematurely.",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Detection",
    description:
      "Automated systems monitor for unusual account activity, duplicate listings, and payment fraud. Suspicious accounts are suspended pending review.",
  },
  {
    icon: Phone,
    title: "24/7 Incident Line",
    description:
      "If you are in immediate danger or have experienced a serious incident related to a Sintherior booking, call our emergency line at +234 800 000 0000.",
  },
];

const tips = [
  {
    heading: "Before hiring an artisan",
    items: [
      "Always use verified artisans (green checkmark on their profile).",
      "Read reviews from multiple clients, not just the most recent.",
      "Agree on scope, timeline, and payment terms in writing before work starts.",
      "Never pay the full amount upfront — use Sintherior Escrow or agree on milestone payments.",
    ],
  },
  {
    heading: "During a project",
    items: [
      "Keep all communication on the Sintherior platform — this creates a record if a dispute arises.",
      "Take photos of work in progress and completed stages.",
      "Do not share personal banking details with artisans or suppliers.",
      "Trust your gut — if something feels off, pause the project and contact support.",
    ],
  },
  {
    heading: "Buying products",
    items: [
      "Check supplier ratings and response rate before placing an order.",
      "Use the platform checkout — do not make off-platform bank transfers.",
      "Inspect deliveries before signing them off.",
      "Report damaged or counterfeit goods within 48 hours of delivery.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="badge-role mb-4 inline-block">Safety</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Your safety is our <span className="gradient-text">first priority</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sintherior is only as good as the trust between the people who use it. Here's how
              we work to keep every transaction safe — and what you can do to protect yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">How we keep you safe</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="card-elevated p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <p.icon strokeWidth={1} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety tips */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">Safety tips for users</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {tips.map((section) => (
              <div key={section.heading}>
                <h3 className="font-display font-semibold text-foreground mb-4">{section.heading}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report */}
      <section className="section-padding bg-destructive/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <AlertTriangle strokeWidth={1} className="w-10 h-10 text-destructive shrink-0" />
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Report a safety concern</h2>
              <p className="text-muted-foreground text-sm">
                If you've experienced or witnessed behaviour that violates our community standards, please
                report it. All reports are treated confidentially.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors shrink-0"
            >
              File a report
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
