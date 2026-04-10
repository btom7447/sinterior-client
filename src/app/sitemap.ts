import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";

/**
 * Static sitemap for public marketing + catalog pages.
 *
 * Dynamic detail pages (/artisan/[id], /products/[id], /real-estate/[id])
 * are intentionally omitted here — they'd require fetching from the API
 * at build time. Add a dynamic sitemap route later if indexing individual
 * listings becomes important.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    // Core marketing
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },

    // Catalog / discovery — highest priority after home
    { path: "/artisan", changeFrequency: "daily", priority: 0.9 },
    { path: "/products", changeFrequency: "daily", priority: 0.9 },
    { path: "/real-estate", changeFrequency: "daily", priority: 0.9 },

    // Auth entry points
    { path: "/login", changeFrequency: "yearly", priority: 0.4 },
    { path: "/signup", changeFrequency: "yearly", priority: 0.7 },

    // Content
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/careers", changeFrequency: "weekly", priority: 0.5 },
    { path: "/feed", changeFrequency: "daily", priority: 0.6 },

    // Support
    { path: "/help", changeFrequency: "monthly", priority: 0.5 },
    { path: "/safety", changeFrequency: "monthly", priority: 0.4 },

    // Legal
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
