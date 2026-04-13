import type { Metadata } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";

interface ArtisanResponse {
  status: string;
  data: {
    artisan: {
      _id: string;
      skill: string;
      skillCategory: string;
      city: string;
      state: string;
      pricePerDay: number | null;
      experienceYears?: number;
      rating: number;
      reviewCount: number;
      profileId?: {
        fullName: string;
        avatarUrl?: string | null;
        bio?: string;
      };
    };
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/artisans/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Not found");

    const json: ArtisanResponse = await res.json();
    const a = json.data.artisan;
    const name = a.profileId?.fullName || "Artisan";
    const location = `${a.city}, ${a.state}`;
    const rate = a.pricePerDay
      ? `₦${a.pricePerDay.toLocaleString("en-NG")}/day`
      : "";

    const title = `${name} – ${a.skill} in ${a.city}`;
    const description = a.profileId?.bio
      ? a.profileId.bio.slice(0, 155)
      : `Hire ${name}, a verified ${a.skill.toLowerCase()} in ${location}${rate ? ` from ${rate}` : ""}. ${a.experienceYears || 0}+ years experience, ${a.rating}/5 rating on Sintherior.`;

    return {
      title,
      description,
      alternates: { canonical: `/artisan/${id}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/artisan/${id}`,
        type: "profile",
      },
    };
  } catch {
    return {
      title: "Artisan Profile",
      description:
        "View artisan profile, reviews, and portfolio on Sintherior — Nigeria's trusted construction marketplace.",
    };
  }
}

export default function ArtisanDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
