import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a relative upload path (e.g. `/uploads/abc.webp`) to an absolute URL
 * pointing at the API server. Returns `null` for falsy inputs, and passes
 * through URLs that are already absolute.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SERVER_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE}${path}`;
}
