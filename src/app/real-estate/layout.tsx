import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate — Properties for Sale & Rent",
  description:
    "Browse verified property listings across Nigeria. Apartments, houses, and commercial properties for sale and rent from trusted agents and owners.",
  alternates: { canonical: "/real-estate" },
  openGraph: {
    title: "Real Estate on Sintherior",
    description:
      "Verified property listings across Nigeria — houses, apartments, and commercial properties for sale and rent.",
    url: "/real-estate",
    type: "website",
  },
  keywords: [
    "real estate Nigeria",
    "houses for sale Nigeria",
    "apartments for rent Lagos",
    "property listings",
    "commercial property Nigeria",
  ],
};

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
