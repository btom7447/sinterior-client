/** API product as returned by GET /api/v1/products */
export interface ApiProduct {
  _id: string;
  supplierId: {
    _id: string;
    fullName: string;
    avatarUrl: string | null;
    city: string;
    state: string;
    phone?: string;
    bio?: string;
  };
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  images: string[];
  quantity: number;
  inStock: boolean;
  lowStockThreshold?: number;
  location?: string;
  specs?: Record<string, string | string[]>;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

/** API property as returned by GET /api/v1/properties */
export interface ApiProperty {
  _id: string;
  supplierId: {
    _id: string;
    fullName: string;
    avatarUrl: string | null;
    city: string;
    state: string;
    phone?: string;
    bio?: string;
  };
  title: string;
  description?: string;
  type: "sale" | "rent";
  propertyType: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: string;
  location?: string;
  city?: string;
  state?: string;
  images: string[];
  features?: string[];
  isActive: boolean;
  createdAt: string;
}

/** API artisan as returned by GET /api/v1/artisans or /artisans/nearby */
export interface ApiArtisan {
  _id: string;
  profileId: {
    _id: string;
    fullName: string;
    avatarUrl: string | null;
    phone?: string;
    city?: string;
    state?: string;
    bio?: string;
  };
  skill: string;
  skillCategory: string;
  city: string;
  state: string;
  pricePerDay: number | null;
  experienceYears?: number;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  availableDays?: string[];
  workHoursStart?: string;
  workHoursEnd?: string;
  tools?: string[];
  additionalSkills?: string[];
  portfolio?: { url: string; caption?: string }[];
  certifications?: { name: string; issuedBy?: string; year?: number }[];
  serviceRadiusKm?: number;
  address?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Format a number as Nigerian Naira */
export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;

/** Placeholder image when product has no images */
const PLACEHOLDER = "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80";

/** Resolve a relative upload path to an absolute URL pointing at the API server */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SERVER_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

export function resolveAssetUrl(path: string): string {
  if (!path || path.startsWith("http")) return path;
  return `${SERVER_BASE}${path}`;
}

/** Get the primary image for a product/property */
export const getPrimaryImage = (images: string[]) =>
  images.length > 0 ? resolveAssetUrl(images[0]) : PLACEHOLDER;
