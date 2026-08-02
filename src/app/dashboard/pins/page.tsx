"use client";

/**
 * An artisan's own work — the pins that make up their portfolio and their feed.
 *
 * There was no pin surface on the web at all. Work could be posted from the app
 * and never edited from a laptop, and the "Portfolio" tab wrote to a completely
 * separate legacy array embedded on the ArtisanProfile — so an artisan had two
 * galleries, neither of which was the whole of their work, and the one on their
 * public page was the one the feed had never heard of.
 *
 * This is the single place now: create, edit, publish, hide, delete. The public
 * profile reads the same pins, so what is here is what people see.
 *
 * Drafts are the reason this cannot just filter the public feed — /pins/feed
 * serves active pins only, which would leave an artisan unable to find the draft
 * they saved yesterday. It reads /pins/mine instead.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/apiClient";
import { useTaxonomy } from "@/hooks/usePins";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface MyPin {
  _id: string;
  mediaUrl: string;
  posterUrl?: string;
  mediaType: "image" | "video";
  title: string;
  caption?: string;
  taxonomy: { trade?: string | null; room?: string | null; budgetBand?: string | null };
  counters?: { saves?: number; likes?: number; comments?: number };
  status: "draft" | "active" | "hidden" | "removed";
  createdAt: string;
}

type Draft = {
  mediaUrl: string;
  mediaType: "image" | "video";
  title: string;
  caption: string;
  trade: string;
  room: string;
};

const EMPTY: Draft = { mediaUrl: "", mediaType: "image", title: "", caption: "", trade: "", room: "" };

export default function DashboardPinsPage() {
  const [pins, setPins] = useState<MyPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MyPin | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { pins: MyPin[] } }>("/pins/mine?limit=100");
      setPins(res.data.pins);
    } catch {
      toast.error("Couldn't load your posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVisible = async (pin: MyPin) => {
    try {
      // publish/unpublish rather than PATCH status: they are the endpoints that
      // also stamp publishedAt, which the feed's ranking reads.
      await apiPost(`/pins/${pin._id}/${pin.status === "active" ? "unpublish" : "publish"}`);
      toast.success(pin.status === "active" ? "Hidden from the feed" : "Live on the feed");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That didn't work");
    }
  };

  const remove = async (pin: MyPin) => {
    if (!confirm(`Delete "${pin.title}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`/pins/${pin._id}`);
      toast.success("Post deleted");
      load();
    } catch {
      toast.error("Couldn't delete that");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My work</h1>
          <p className="text-sm text-muted-foreground mt-1">
            These posts are your portfolio and your feed — the same ones people see on your
            public profile.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New post
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : pins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold text-foreground">Nothing posted yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Photographs of finished jobs are what get you hired here.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Post your first job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pins.map((pin) => (
            <div
              key={pin._id}
              className={`group rounded-xl overflow-hidden border bg-card transition-colors ${
                pin.status === "active" ? "border-border" : "border-dashed border-border opacity-70"
              }`}
            >
              <div className="relative aspect-square bg-accent">
                {pin.mediaUrl && (
                  <Image
                    src={pin.posterUrl || pin.mediaUrl}
                    alt={pin.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                {pin.mediaType === "video" && (
                  <span className="absolute top-2 left-2 grid place-items-center w-7 h-7 rounded-full bg-black/60">
                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                  </span>
                )}
                {pin.status !== "active" && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-foreground/80 text-background text-[10px] font-bold uppercase tracking-wide">
                    {pin.status}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground line-clamp-2">{pin.title}</p>
                <p className="text-xs text-muted-foreground">
                  {pin.counters?.saves ?? 0} saved · {pin.counters?.likes ?? 0} liked
                </p>

                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => {
                      setEditing(pin);
                      setOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg text-xs font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVisible(pin)}
                    className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                    title={pin.status === "active" ? "Hide from feed" : "Publish to feed"}
                  >
                    {pin.status === "active" ? (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    onClick={() => remove(pin)}
                    className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <PinEditor
          pin={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSaved={() => {
            setOpen(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PinEditor({
  pin,
  onClose,
  onSaved,
}: {
  pin: MyPin | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: taxonomy } = useTaxonomy();
  const [draft, setDraft] = useState<Draft>(
    pin
      ? {
          mediaUrl: pin.mediaUrl,
          mediaType: pin.mediaType,
          title: pin.title,
          caption: pin.caption ?? "",
          trade: pin.taxonomy?.trade ?? "",
          room: pin.taxonomy?.room ?? "",
        }
      : EMPTY
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("images", file);
      const res = await apiUpload<{ data: { urls?: string[]; media?: { url: string }[] } }>(
        "/pins/upload",
        form
      );
      const url = res.data.urls?.[0] ?? res.data.media?.[0]?.url;
      if (!url) throw new Error("Upload returned nothing");
      setDraft((d) => ({ ...d, mediaUrl: url, mediaType: "image" }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft.mediaUrl) return toast.error("Add a photo first");
    if (draft.title.trim().length < 3) return toast.error("Give it a title");

    setSaving(true);
    try {
      const body = {
        mediaUrl: draft.mediaUrl,
        mediaType: draft.mediaType,
        title: draft.title.trim(),
        caption: draft.caption.trim() || undefined,
        taxonomy: { trade: draft.trade || null, room: draft.room || null },
      };
      if (pin) {
        await apiPatch(`/pins/${pin._id}`, body);
        toast.success("Post updated");
      } else {
        await apiPost("/pins", body);
        toast.success("Posted");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="font-display text-lg font-bold text-foreground">
            {pin ? "Edit post" : "New post"}
          </h2>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* The photograph is the post. Everything else is caption. */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-accent grid place-items-center group cursor-pointer border border-dashed border-border"
          >
            {draft.mediaUrl ? (
              <Image src={draft.mediaUrl} alt="" fill sizes="512px" className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="w-7 h-7" strokeWidth={1.5} />
                <span className="text-sm font-medium">Add a photo of the finished job</span>
              </span>
            )}
            <span className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-background animate-spin" />
              ) : (
                <ImagePlus className="w-5 h-5 text-background" strokeWidth={1.5} />
              )}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />

          <div className="space-y-1.5">
            <label htmlFor="pin-title" className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <input
              id="pin-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Duplex repaint, Lekki Phase 1"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pin-caption" className="text-xs font-medium text-muted-foreground">
              What was involved
            </label>
            <textarea
              id="pin-caption"
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              rows={6}
              placeholder="What the job was, and what it actually took to do it. The second part is what gets you hired — a photo shows the result, this shows you knew what you were doing."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="pin-trade" className="text-xs font-medium text-muted-foreground">
                Trade
              </label>
              <select
                id="pin-trade"
                value={draft.trade}
                onChange={(e) => setDraft({ ...draft, trade: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">Not set</option>
                {(taxonomy?.trades ?? []).map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pin-room" className="text-xs font-medium text-muted-foreground">
                Room
              </label>
              <select
                id="pin-room"
                value={draft.room}
                onChange={(e) => setDraft({ ...draft, room: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">Not set</option>
                {(taxonomy?.rooms ?? []).map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tagging is what makes the post findable — the feed filters on it. */}
          <p className="text-xs text-muted-foreground">
            The trade and room are how people filter the feed. A post without them is one
            nobody browsing for exactly your work will find.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {pin ? "Save changes" : "Post it"}
          </button>
        </div>
      </div>
    </div>
  );
}
