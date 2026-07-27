"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, ShoppingBag, Home, Hammer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePin } from "@/hooks/usePins";
import { useTaxonomy } from "@/hooks/usePins";
import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";
import { useAuth } from "@/hooks/useAuth";
import BoardPickerDialog from "./BoardPickerDialog";
import { taxonomyLabel } from "@/types/pins";
import type { Pin } from "@/types/pins";

interface PinDetailProps {
  pinId: string;
  initial: { pin: Pin; savedByMe: boolean };
}

/**
 * The pin modal's content (full page for now; route interception adds the
 * overlay treatment in a follow-up). Commerce leads: the CTA sits above the
 * fold and carries ?from=pin:<id> so downstream flows can attribute WCAF.
 */
const PinDetail = ({ pinId, initial }: PinDetailProps) => {
  const router = useRouter();
  const { data } = usePin(pinId, initial);
  const { data: taxonomy } = useTaxonomy();
  const [savingPin, setSavingPin] = useState<Pin | null>(null);

  const pin = data?.pin ?? initial.pin;
  const author = pin.author;

  const { data: followState } = useFollowStatus(
    author && ["artisan", "supplier"].includes(author.role) ? author._id : undefined
  );
  const toggleFollow = useToggleFollow(author?._id);
  const { isAuthenticated } = useAuth();

  const from = `from=pin:${pin._id}`;
  const cta =
    pin.sourceType === "product" && pin.sourceRef
      ? { href: `/products/${pin.sourceRef}?${from}`, label: "View product", icon: ShoppingBag }
      : pin.sourceType === "property" && pin.sourceRef
        ? { href: `/real-estate/${pin.sourceRef}?${from}`, label: "View property", icon: Home }
        : author && author.role === "supplier"
          ? { href: `/seller/${author._id}?${from}`, label: `Shop ${author.fullName}`, icon: ShoppingBag }
          : author
            ? { href: `/artisan/${author._id}?${from}`, label: `Hire ${author.fullName.split(" ")[0]}`, icon: Hammer }
            : null;

  const band = pin.taxonomy.budgetBand
    ? taxonomy?.budgetBands.find((b) => b.id === pin.taxonomy.budgetBand)
    : null;

  const share = async () => {
    const url = `${window.location.origin}/pin/${pin._id}`;
    if (navigator.share) {
      await navigator.share({ title: pin.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  const onFollow = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/pin/${pin._id}`)}`);
      return;
    }
    toggleFollow.mutate(!!followState?.isFollowing);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-4 grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)] lg:grid lg:grid-cols-2">
        {/* Media */}
        <div className="relative bg-secondary">
          {pin.mediaType === "video" ? (
            <video
              controls
              playsInline
              preload="none"
              poster={pin.posterUrl}
              className="h-full w-full object-contain"
              style={{ aspectRatio: pin.aspectRatio || 1 }}
            >
              <source src={pin.mediaUrl} />
            </video>
          ) : (
            <div className="relative w-full" style={{ aspectRatio: pin.aspectRatio || 1 }}>
              <Image
                src={pin.mediaUrl}
                alt={pin.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSavingPin(pin)}
              className="rounded-full px-6 font-semibold"
            >
              {data?.savedByMe ? "Saved" : "Save"}
            </Button>
            {cta && (
              <Button asChild variant="secondary" className="rounded-full px-5 font-semibold">
                <Link href={cta.href}>
                  <cta.icon className="mr-1.5 h-4 w-4" />
                  {cta.label}
                </Link>
              </Button>
            )}
            <button
              onClick={share}
              className="ml-auto grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div>
            <h1 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
              {pin.title}
            </h1>
            {pin.caption && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pin.caption}</p>
            )}
          </div>

          {(pin.taxonomy.trade || pin.taxonomy.room || band) && (
            <div className="flex flex-wrap gap-1.5">
              {pin.taxonomy.trade && (
                <Link
                  href={`/?trade=${pin.taxonomy.trade}`}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
                >
                  {taxonomyLabel(pin.taxonomy.trade)}
                </Link>
              )}
              {pin.taxonomy.room && (
                <Link
                  href={`/?room=${pin.taxonomy.room}`}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
                >
                  {taxonomyLabel(pin.taxonomy.room)}
                </Link>
              )}
              {band && (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {band.label}
                </span>
              )}
            </div>
          )}

          {author && (
            <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
              <Link
                href={author.role === "supplier" ? `/seller/${author._id}` : `/artisan/${author._id}`}
                className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary"
              >
                {author.avatarUrl ? (
                  <Image src={author.avatarUrl} alt={author.fullName} fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-sm font-bold text-muted-foreground">
                    {author.fullName?.charAt(0) || "?"}
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{author.fullName}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {author.role}
                  {followState ? ` · ${followState.followers} follower${followState.followers === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              {["artisan", "supplier"].includes(author.role) && (
                <Button
                  variant={followState?.isFollowing ? "secondary" : "outline"}
                  onClick={onFollow}
                  disabled={toggleFollow.isPending}
                  className="rounded-full px-4 text-sm font-semibold"
                >
                  {followState?.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <BoardPickerDialog pin={savingPin} onClose={() => setSavingPin(null)} />
    </div>
  );
};

export default PinDetail;
