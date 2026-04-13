import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Dynamic sitemap — fetches product and artisan IDs from the API so
 * Google can discover and index individual listing pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/artisan`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/real-estate`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic routes — fetch IDs from the API (best-effort, fallback to static-only)
  let productRoutes: MetadataRoute.Sitemap = [];
  let artisanRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API_BASE}/products?limit=100`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      const products = json.data || [];
      productRoutes = products.map((p: { _id: string; createdAt?: string }) => ({
        url: `${SITE_URL}/products/${p._id}`,
        lastModified: p.createdAt ? new Date(p.createdAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // API unreachable — skip dynamic products
  }

  try {
    const res = await fetch(`${API_BASE}/artisans?limit=100`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      const artisans = json.data || [];
      artisanRoutes = artisans.map((a: { _id: string }) => ({
        url: `${SITE_URL}/artisan/${a._id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // API unreachable — skip dynamic artisans
  }

  return [...staticRoutes, ...productRoutes, ...artisanRoutes];
}
