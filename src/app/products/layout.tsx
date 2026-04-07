import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quality Building Materials & Supplies",
  description:
    "Shop verified suppliers for cement, tiles, paint, plumbing, electrical fittings, roofing, and more. Competitive prices, delivery across Nigeria.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Building Materials & Supplies on Sintherior",
    description:
      "Shop quality construction materials from verified Nigerian suppliers — cement, tiles, paint, fittings, and more.",
    url: "/products",
    type: "website",
  },
  keywords: [
    "building materials Nigeria",
    "cement suppliers",
    "tiles Nigeria",
    "plumbing supplies",
    "electrical fittings",
    "construction materials",
  ],
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
