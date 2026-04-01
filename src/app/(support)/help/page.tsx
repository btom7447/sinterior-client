"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Search, ChevronRight, ChevronDown } from "lucide-react";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    emoji: "🚀",
    articles: [
      "How to create a Sintherior account",
      "Choosing the right account type (Client, Artisan, Supplier)",
      "Completing your profile",
      "Understanding the verification process",
    ],
  },
  {
    id: "for-clients",
    title: "For Clients",
    emoji: "🏠",
    articles: [
      "How to find and hire an artisan",
      "How to browse and purchase products",
      "Tracking your orders",
      "Leaving a review",
      "Requesting a refund",
    ],
  },
  {
    id: "for-artisans",
    title: "For Artisans",
    emoji: "🔧",
    articles: [
      "Getting verified as an artisan",
      "Setting your rates and availability",
      "Managing client requests",
      "Getting paid on Sintherior",
      "Upgrading your subscription",
    ],
  },
  {
    id: "for-suppliers",
    title: "For Suppliers",
    emoji: "📦",
    articles: [
      "Listing your products",
      "Managing inventory",
      "Processing orders",
      "Handling returns",
      "Becoming a featured supplier",
    ],
  },
  {
    id: "payments",
    title: "Payments & Billing",
    emoji: "💳",
    articles: [
      "Accepted payment methods",
      "How payouts work for artisans",
      "Subscription plans and pricing",
      "Requesting a billing statement",
      "VAT and receipts",
    ],
  },
  {
    id: "account",
    title: "Account & Security",
    emoji: "🔒",
    articles: [
      "Changing your password",
      "Two-factor authentication",
      "Updating your email address",
      "Deactivating your account",
      "Reporting a suspicious account",
    ],
  },
];

const faqs = [
  {
    question: "Is Sintherior free to use?",
    answer:
      "Clients can browse and hire for free. Artisans and suppliers have a free tier with limited features. Paid subscriptions unlock priority placement, analytics, and more.",
  },
  {
    question: "How does Sintherior verify artisans?",
    answer:
      "We verify government-issued ID, check trade certifications where applicable, collect a phone number, and in some cases conduct in-person or video inspections. Verified artisans display a green checkmark on their profile.",
  },
  {
    question: "What happens if I'm unsatisfied with an artisan's work?",
    answer:
      "Contact us within 7 days of project completion. We'll mediate the dispute and, where warranted, arrange for the work to be redone or issue a partial refund.",
  },
  {
    question: "Can I pay through Sintherior or only directly to artisans?",
    answer:
      "You can pay directly through the platform (card, bank transfer, or USSD). Sintherior holds the funds in escrow and releases them when you confirm the work is done.",
  },
  {
    question: "Are suppliers' products genuine?",
    answer:
      "Suppliers submit business registration documents, and we periodically spot-check product quality. Listings that receive multiple quality complaints are removed.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <span className="badge-role mb-4 inline-block">Help Center</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <div className="relative">
            <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-base shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">Browse by topic</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div key={cat.id} className="card-elevated p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-display font-semibold text-foreground">{cat.title}</h3>
                </div>
                <ul className="space-y-2">
                  {cat.articles.map((article) => (
                    <li key={article}>
                      <Link
                        href="#"
                        className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors py-1 group"
                      >
                        <span>{article}</span>
                        <ChevronRight strokeWidth={1} className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    strokeWidth={1}
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="font-semibold text-foreground mb-1">Still need help?</p>
            <p className="text-sm text-muted-foreground mb-4">Our support team is available Monday–Friday, 8 am–6 pm WAT.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
