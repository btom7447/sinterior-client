/**
 * Variant rows for the web product form.
 *
 * The web could not see variants at all, which was not merely a missing
 * feature: a supplier who built a variant table on the phone and then opened
 * that listing on a laptop saw one price and one stock box, and the quantity
 * they typed there overwrote a summary of rows they never knew existed.
 *
 * Keys are canonical and sorted, matching server/src/config/pricing.js exactly.
 * The server recomputes them on write and never trusts a client's — the key is
 * what a stock decrement matches on — but generating the same string here keeps
 * an edited row attached to the one it came from.
 */

export interface VariantAxis {
  name: string;
  values: string[];
}

export interface VariantRow {
  key: string;
  options: Record<string, string>;
  price: string;
  quantity: string;
  sku?: string;
  /** A photograph of this exact combination. Drives the buyer's swatches. */
  image?: string;
}

/** Past this a variant table stops being a table and becomes a spreadsheet. */
export const MAX_ROWS = 60;

/** Canonical and sorted — must match skuKeyFor in server/src/config/pricing.js. */
export function keyFor(options: Record<string, string>): string {
  return Object.entries(options)
    .filter(([name, value]) => name && value)
    .map(([name, value]) => [name.trim(), value.trim()] as const)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => `${name}:${value}`)
    .join("|");
}

/** "600x600, 300x600" → ["600x600", "300x600"], deduped. */
export function parseValues(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
  }
  return out;
}

/**
 * Every combination the axes imply, keeping what has already been filled in.
 *
 * Adding a fifth colour must not discard the prices, counts and photographs on
 * the other four — which is why existing rows are matched by key rather than by
 * position.
 */
export function buildRows(axes: VariantAxis[], existing: VariantRow[] = []): VariantRow[] {
  const usable = axes.filter((a) => a.name.trim() && a.values.length);
  if (!usable.length) return [];

  let combos: Record<string, string>[] = [{}];
  for (const axis of usable) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of axis.values) {
        next.push({ ...combo, [axis.name.trim()]: value });
        if (next.length >= MAX_ROWS) break;
      }
      if (next.length >= MAX_ROWS) break;
    }
    combos = next;
  }

  const before = new Map(existing.map((row) => [row.key, row]));

  return combos.slice(0, MAX_ROWS).map((options) => {
    const key = keyFor(options);
    const kept = before.get(key);
    return {
      key,
      options,
      price: kept?.price ?? "",
      quantity: kept?.quantity ?? "",
      sku: kept?.sku,
      image: kept?.image,
    };
  });
}

/** A short label for a row: "600x600 · Matt". */
export const rowLabel = (row: VariantRow) => Object.values(row.options).join(" · ");

/** What is wrong with the table, or null. */
export function checkVariants(rows: VariantRow[]): string | null {
  if (!rows.length) return null;
  for (const row of rows) {
    const price = Number(row.price);
    if (!row.price.trim() || !Number.isFinite(price) || price < 0) {
      return `Give "${rowLabel(row)}" a price.`;
    }
    const qty = Number(row.quantity);
    if (row.quantity.trim() && (!Number.isFinite(qty) || qty < 0)) {
      return `"${rowLabel(row)}" has a stock count that is not a number.`;
    }
  }
  return null;
}

/** The rows as the server wants them. */
export function toSkuBody(rows: VariantRow[]) {
  return rows.map((row) => ({
    key: row.key,
    options: row.options,
    price: Number(row.price) || 0,
    quantity: Number(row.quantity) || 0,
    sku: row.sku?.trim() || undefined,
    image: row.image || undefined,
  }));
}

/** The product-level count is the sum of the rows that define it. */
export const totalStock = (rows: VariantRow[]) =>
  rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
