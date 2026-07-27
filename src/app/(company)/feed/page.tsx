import type { Metadata } from "next";
import { Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import FeedHome from "@/components/feed/FeedHome";
import type { FeedResponse } from "@/types/pins";

const RAW_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_BASE = RAW_API.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_API.replace(/\/+$/, "")
  : `${RAW_API.replace(/\/+$/, "")}/api/v1`;

export const metadata: Metadata = {
  title: "Feed — Real Work by Nigerian Artisans | Sintherior",
  description:
    "Browse real projects, products, and properties from verified Nigerian artisans and suppliers. Save ideas to boards, then hire the people who made them.",
  alternates: { canonical: "/feed" },
};

/**
 * Pinterest-style pin feed (the web twin of the mobile app's home surface).
 * First page is fetched server-side (anonymous ranking, 60s revalidate) so
 * the initial paint carries real pins; the client hydrates into the infinite
 * query and personalizes when logged in.
 */
async function fetchFirstPage(): Promise<FeedResponse["data"] | null> {
  try {
    const res = await fetch(`${API_BASE}/pins/feed?limit=24`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return ((await res.json()) as FeedResponse).data;
  } catch {
    return null; // client fetch takes over
  }
}

export default async function FeedPage() {
  const initialPage = await fetchFirstPage();

  return (
    <AppLayout>
      <Suspense>
        <FeedHome initialPage={initialPage} basePath="/feed" />
      </Suspense>
    </AppLayout>
  );
}
