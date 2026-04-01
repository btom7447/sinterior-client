"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiPost } from "@/lib/apiClient";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@sinterior.ng",
    href: "mailto:hello@sinterior.ng",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+234 800 SINTERIOR",
    href: "tel:+2348007468374",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "14 Admiralty Way, Lekki Phase 1, Lagos",
    href: null,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Monday – Friday, 8 am – 6 pm WAT",
    href: null,
  },
];

const topics = [
  "General enquiry",
  "Partnership",
  "Supplier onboarding",
  "Artisan onboarding",
  "Technical issue",
  "Press / Media",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/contact", form);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", topic: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="badge-role mb-4 inline-block">Contact</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Get in <span className="gradient-text">touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question or want to work with us? We typically respond within one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="flex flex-col gap-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon strokeWidth={1} className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare strokeWidth={1} className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Live chat</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  For urgent issues, use the chat widget in the bottom-right corner of any page.
                  Available 8 am – 6 pm WAT.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 card-elevated p-6 sm:p-8 flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Topic</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a topic…</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  placeholder="Tell us what's on your mind…"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 h-11 text-base"
              >
                {loading ? "Sending…" : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
