"use client";

import { useTaxonomy } from "@/hooks/usePins";
import type { FeedFilters } from "@/types/pins";
import { taxonomyLabel } from "@/types/pins";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterChipsProps {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
}

/**
 * One scrollable row: trade chips lead (the market's primary axis), room and
 * budget ride along as compact pill-selects. State lives in the URL upstream
 * so filtered feeds are shareable.
 */
const FilterChips = ({ filters, onChange }: FilterChipsProps) => {
  const { data: taxonomy } = useTaxonomy();

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-foreground text-background"
        : "bg-secondary text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <button
        className={chip(!filters.trade)}
        onClick={() => onChange({ ...filters, trade: undefined })}
      >
        All
      </button>
      {taxonomy?.trades.map((t) => (
        <button
          key={t}
          className={chip(filters.trade === t)}
          onClick={() => onChange({ ...filters, trade: filters.trade === t ? undefined : t })}
        >
          {taxonomyLabel(t)}
        </button>
      ))}

      <span className="mx-1 h-6 w-px shrink-0 bg-border" />

      <Select
        value={filters.room ?? "any"}
        onValueChange={(v) => onChange({ ...filters, room: v === "any" ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-auto shrink-0 gap-1 rounded-full border-none bg-secondary px-4 text-sm font-semibold text-muted-foreground">
          <SelectValue placeholder="Room" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any room</SelectItem>
          {taxonomy?.rooms.map((r) => (
            <SelectItem key={r} value={r}>
              {taxonomyLabel(r)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.budgetBand ?? "any"}
        onValueChange={(v) => onChange({ ...filters, budgetBand: v === "any" ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-auto shrink-0 gap-1 rounded-full border-none bg-secondary px-4 text-sm font-semibold text-muted-foreground">
          <SelectValue placeholder="Budget" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any budget</SelectItem>
          {taxonomy?.budgetBands.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterChips;
