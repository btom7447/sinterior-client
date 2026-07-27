"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Pin, BudgetBand } from "@/types/pins";

interface PinCardProps {
  pin: Pin;
  bands?: BudgetBand[];
  onSave: (pin: Pin) => void;
}

/**
 * One pin in the masonry. The photo is the interface — chrome stays inside
 * the hover overlay (save pill, ₦ band, video glyph) so a resting feed reads
 * as pure work. Cell height comes from the server-stored aspect ratio: the
 * grid never shifts as media loads.
 */
const PinCard = ({ pin, bands, onSave }: PinCardProps) => {
  const band = pin.taxonomy.budgetBand
    ? bands?.find((b) => b.id === pin.taxonomy.budgetBand)
    : null;

  return (
    <div className="group relative mb-4 break-inside-avoid">
      <Link href={`/pin/${pin._id}`} className="block">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-secondary"
          style={{ aspectRatio: pin.aspectRatio || 1 }}
        >
          <Image
            src={pin.mediaType === "video" ? pin.posterUrl || pin.mediaUrl : pin.mediaUrl}
            alt={pin.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {pin.mediaType === "video" && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-foreground/55 backdrop-blur-sm">
                <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
              </span>
            </span>
          )}

          {/* Hover chrome — save leads, band grounds the price question */}
          <div className="absolute inset-0 flex flex-col justify-between bg-foreground/0 p-3 opacity-0 transition-opacity duration-200 group-hover:bg-foreground/25 group-hover:opacity-100">
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave(pin);
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Save
              </button>
            </div>
            {band && (
              <div className="flex justify-start">
                <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                  {band.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {pin.title}
          </h3>
          {pin.author && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="relative h-6 w-6 overflow-hidden rounded-full bg-secondary">
                {pin.author.avatarUrl ? (
                  <Image
                    src={pin.author.avatarUrl}
                    alt={pin.author.fullName}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-[10px] font-bold text-muted-foreground">
                    {pin.author.fullName?.charAt(0) || "?"}
                  </span>
                )}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {pin.author.fullName}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PinCard;
