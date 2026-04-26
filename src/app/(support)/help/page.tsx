"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

interface HelpArticle {
  _id: string;
  slug: string;
  title: string;
  category?: string;
  emoji?: string;
  excerpt?: string;
  order?: number;
}

interface CategoryGroup {
  category: string;
  emoji: string;
  articles: HelpArticle[];
}

const fallbackEmoji: Record<string, string> = {
  "Getting Started": "🚀",
  "For Clients": "🏠",
  "For Artisans": "🔧",
  "For Suppliers": "📦",
  "Payments & Billing": "💳",
  "Account & Security": "🔒",
};

export default function HelpPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [openBody, setOpenBody] = useState<Record<string, string>>({});

  useEffect(() => {
    apiGet<{ data: { articles: HelpArticle[] } }>("/help")
      .then((r) => setArticles(r.data.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q)
    );
  }, [articles, search]);

  const grouped: CategoryGroup[] = useMemo(() => {
    const map = new Map<string, CategoryGroup>();
    for (const a of filtered) {
      const cat = a.category || "Other";
      if (!map.has(cat)) {
        map.set(cat, {
          category: cat,
          emoji: a.emoji || fallbackEmoji[cat] || "📘",
          articles: [],
        });
      }
      map.get(cat)!.articles.push(a);
    }
    return Array.from(map.values()).map((g) => ({
      ...g,
      articles: g.articles.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));
  }, [filtered]);

  const toggle = async (slug: string) => {
    if (openSlug === slug) {
      setOpenSlug(null);
      return;
    }
    setOpenSlug(slug);
    if (!openBody[slug]) {
      try {
        const res = await apiGet<{ data: { article: { body: string } } }>(`/help/${slug}`);
        setOpenBody((prev) => ({ ...prev, [slug]: res.data.article.body }));
      } catch {
        setOpenBody((prev) => ({ ...prev, [slug]: "Could not load this article." }));
      }
    }
  };

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
            <Search
              strokeWidth={1}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            />
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

      {/* Articles */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-elevated p-5 space-y-3">
                  <Skeleton className="h-6 w-32" />
                  {Array.from({ length: 3 }).map((__, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {search.trim() ? "No articles match your search." : "No help articles yet."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grouped.map((group) => (
                <div key={group.category} className="card-elevated p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{group.emoji}</span>
                    <h3 className="font-display font-semibold text-foreground">
                      {group.category}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {group.articles.map((article) => (
                      <li key={article._id}>
                        <button
                          onClick={() => toggle(article.slug)}
                          className="w-full flex items-center justify-between text-left text-sm text-muted-foreground hover:text-primary transition-colors py-2 group"
                        >
                          <span className="pr-3">{article.title}</span>
                          {openSlug === article.slug ? (
                            <ChevronDown
                              strokeWidth={1}
                              className="w-4 h-4 shrink-0 text-primary"
                            />
                          ) : (
                            <ChevronRight
                              strokeWidth={1}
                              className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </button>
                        {openSlug === article.slug && (
                          <div className="text-sm text-foreground leading-relaxed py-2 pl-1 pr-2 whitespace-pre-wrap border-l-2 border-primary/30 ml-1 mt-1">
                            {openBody[article.slug] ? (
                              openBody[article.slug]
                                .replace(/^#+\s*/gm, "") // strip markdown headers for inline render
                                .trim()
                            ) : (
                              <span className="text-muted-foreground">Loading…</span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-primary/5 border border-primary/10 max-w-2xl mx-auto">
            <p className="font-semibold text-foreground mb-1">Still need help?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is available Monday–Friday, 8 am–6 pm WAT.
            </p>
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
