import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PinDetail from "@/components/feed/PinDetail";
import type { PinDetailResponse } from "@/types/pins";

const RAW_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const API_BASE = RAW_API.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_API.replace(/\/+$/, "")
  : `${RAW_API.replace(/\/+$/, "")}/api/v1`;

async function fetchPin(id: string) {
  try {
    const res = await fetch(`${API_BASE}/pins/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return ((await res.json()) as PinDetailResponse).data;
  } catch {
    return null;
  }
}

/** Real URL per pin — WhatsApp shares get a proper preview card. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchPin(id);
  if (!data) return { title: "Pin — Sintherior" };
  const { pin } = data;
  return {
    title: `${pin.title} — Sintherior`,
    description:
      pin.caption ||
      `${pin.author?.fullName ? `Work by ${pin.author.fullName} on ` : ""}Sintherior — save it, hire the maker, or buy the materials.`,
    openGraph: {
      title: pin.title,
      description: pin.caption || "Found on Sintherior",
      images: [{ url: pin.mediaType === "video" ? pin.posterUrl || pin.mediaUrl : pin.mediaUrl }],
    },
  };
}

export default async function PinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchPin(id);
  if (!data) notFound();

  return (
    <AppLayout>
      <PinDetail initial={data} pinId={id} />
    </AppLayout>
  );
}
