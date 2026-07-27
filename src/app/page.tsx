import { Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import FeedHome from "@/components/feed/FeedHome";
import type { FeedResponse } from "@/types/pins";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";
const RAW_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_BASE = RAW_API.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_API.replace(/\/+$/, "")
  : `${RAW_API.replace(/\/+$/, "")}/api/v1`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sintherior",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png`, width: 208, height: 208 },
      description:
        "Nigeria's visual marketplace for construction and interior design — browse real artisan work, save ideas to boards, and hire the people who made them.",
      areaServed: { "@type": "Country", name: "Nigeria" },
      sameAs: [
        "https://twitter.com/sintherior",
        "https://www.facebook.com/sintherior",
        "https://www.instagram.com/sintherior",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sintherior",
      description:
        "Browse and save real work by verified Nigerian artisans — then hire them, buy materials, or book property viewings.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-NG",
    },
  ],
};

/**
 * Home IS the feed (DECISIONS 2026-07-27). First page is fetched on the server
 * (anonymous ranking, 60s revalidate) so the landing paint carries real pins;
 * the client hydrates it into the infinite query and personalizes on scroll.
 */
async function fetchFirstPage(): Promise<FeedResponse["data"] | null> {
  try {
    const res = await fetch(`${API_BASE}/pins/feed?limit=24`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as FeedResponse;
    return json.data;
  } catch {
    return null; // client fetch takes over
  }
}

export default async function HomePage() {
  const initialPage = await fetchFirstPage();

  return (
    <AppLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <FeedHome initialPage={initialPage} />
      </Suspense>
    </AppLayout>
  );
}
