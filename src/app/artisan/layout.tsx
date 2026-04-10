import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Verified Artisans Near You",
  description:
    "Browse thousands of verified carpenters, electricians, plumbers, masons, painters, and more across Nigeria. Filter by location, skill, and rating.",
  alternates: { canonical: "/artisan" },
  openGraph: {
    title: "Find Verified Artisans on Sintherior",
    description:
      "Discover skilled construction professionals near you — carpenters, electricians, plumbers, masons, painters, and more.",
    url: "/artisan",
    type: "website",
  },
  keywords: [
    "artisans near me",
    "hire carpenter Nigeria",
    "hire plumber Nigeria",
    "hire electrician Nigeria",
    "find construction workers",
    "verified artisans",
  ],
};

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
