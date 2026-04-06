/**
 * Shared constants used across the app.
 */

export const PRODUCT_CATEGORIES = [
  "Lightings & Electrical",
  "Panels",
  "Wallpaper",
  "Doors",
  "Walls",
  "Cement",
  "Steel & Iron",
  "Tiles & Flooring",
  "Paints",
  "Roofing & Ceiling",
  "Smart Home",
  "Furniture",
  "Plumbing",
  "Aggregates",
  "Wood & Timber",
  "Automobile",
  "Laundromat",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatNaira = (amount: number) => NAIRA.format(amount);
