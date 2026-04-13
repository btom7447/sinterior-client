"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/apiClient";

interface CareerListing {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
}

const perks = [
  { emoji: "🏥", title: "Health Insurance", desc: "Full medical, dental, and vision coverage for you and your family." },
  { emoji: "🏖️", title: "Generous Leave", desc: "25 days annual leave plus public holidays and mental health days." },
  { emoji: "📚", title: "Learning Budget", desc: "₦500,000 per year for courses, conferences, and books." },
  { emoji: "🏠", title: "Flexible Work", desc: "Hybrid arrangements for most roles — work where you do your best." },
  { emoji: "📈", title: "Equity", desc: "All full-time employees receive meaningful stock options." },
  { emoji: "🍔", title: "Lunch Stipend", desc: "Daily meal allowance for in-office days." },
];

const formatType = (t?: string) => {
  if (!t) return "";
  return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function CareersPage() {
  const [openings, setOpenings] = useState<CareerListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ data: { careers: CareerListing[] } }>(
          "/careers?limit=50"
        );
        setOpenings(res.data.careers);
      } catch {
        setOpenings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="badge-role mb-4 inline-block">Careers</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Help us build the future of{" "}
              <span className="gradient-text">construction in Nigeria</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We&apos;re a small team with a big mission. If you want to work on hard
              problems that matter to millions of Nigerians, we&apos;d love to meet you.
            </p>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">
            Why work at Sintherior
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="flex gap-4 p-5 rounded-2xl border border-border bg-card"
              >
                <span className="text-2xl shrink-0">{perk.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">{perk.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Open roles
          </h2>
          <p className="text-muted-foreground mb-8">
            Don&apos;t see a fit? Send your CV to{" "}
            <a
              href="mailto:careers@sinterior.ng"
              className="text-primary hover:underline"
            >
              careers@sinterior.ng
            </a>
          </p>

          {loading ? (
            <p className="text-muted-foreground">Loading open roles...</p>
          ) : openings.length === 0 ? (
            <p className="text-muted-foreground">
              No open roles right now — check back soon.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {openings.map((job) => (
                <div
                  key={job._id}
                  className="card-elevated p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {job.title}
                      </h3>
                      {job.department && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {job.department}
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {job.location && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin strokeWidth={1} className="w-3.5 h-3.5" />{" "}
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock strokeWidth={1} className="w-3.5 h-3.5" />{" "}
                          {formatType(job.type)}
                        </span>
                      )}
                    </div>
                  </div>
                  <a href="mailto:careers@sinterior.ng?subject=Application" className="shrink-0">
                    <Button className="rounded-xl bg-primary hover:bg-primary/90">
                      Apply <ArrowRight strokeWidth={1} className="w-4 h-4 ml-1.5" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
