import type { Metadata } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.sintherior.com";

interface ProductResponse {
  status: string;
  data: {
    product: {
      _id: string;
      name: string;
      description?: string;
      category: string;
      price: number;
      images: string[];
      supplierId?: { fullName: string; city?: string };
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
    const res = await fetch(`${API_BASE}/products/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Not found");

    const json: ProductResponse = await res.json();
    const p = json.data.product;
    const price = `₦${p.price.toLocaleString("en-NG")}`;
    const supplier = p.supplierId?.fullName || "Verified Supplier";
    const location = p.supplierId?.city || "Nigeria";

    const title = `${p.name} – ${price} | ${p.category}`;
    const description = p.description
      ? p.description.slice(0, 155)
      : `Buy ${p.name} (${p.category}) for ${price} from ${supplier} in ${location}. Quality building materials on Sintherior.`;

    return {
      title,
      description,
      alternates: { canonical: `/products/${id}` },
      openGraph: {
        title: `${p.name} – ${price}`,
        description,
        url: `${SITE_URL}/products/${id}`,
        type: "website",
        images: p.images.length > 0 ? [{ url: p.images[0] }] : undefined,
      },
    };
  } catch {
    return {
      title: "Product Details",
      description:
        "View product details and pricing from verified suppliers on Sintherior.",
    };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
