/** Feed domain types — mirror server/src/models/Pin.js + pin.controller responses. */

export type PinSourceType = "native" | "product" | "property" | "admin";
export type PinMediaType = "image" | "video";

export interface PinAuthor {
  _id: string;
  fullName: string;
  avatarUrl?: string | null;
  role: "client" | "artisan" | "supplier" | "admin";
  city?: string;
  state?: string;
}

export interface PinTaxonomy {
  trade: string | null;
  room: string | null;
  budgetBand: string | null;
  tags: string[];
}

export interface Pin {
  _id: string;
  author: PinAuthor | null;
  sourceType: PinSourceType;
  sourceRef: string | null;
  mediaType: PinMediaType;
  mediaUrl: string;
  posterUrl?: string;
  aspectRatio: number;
  title: string;
  caption?: string;
  taxonomy: PinTaxonomy;
  counters: { saves: number; views: number };
  status: "active" | "hidden" | "removed";
  isFeatured: boolean;
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  data: { pins: Pin[]; nextCursor: string | null };
}

export interface PinDetailResponse {
  success: boolean;
  data: { pin: Pin; savedByMe: boolean };
}

export interface BudgetBand {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export interface Taxonomy {
  trades: string[];
  rooms: string[];
  budgetBands: BudgetBand[];
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  coverUrl?: string;
  pinCount: number;
  updatedAt: string;
}

export interface FeedFilters {
  trade?: string;
  room?: string;
  budgetBand?: string;
  tag?: string;
  author?: string;
}

/** Human label for a taxonomy id: "wall-decoration" → "Wall Decoration". */
export const taxonomyLabel = (id: string) =>
  id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
