"use client";

/**
 * The shop's shelves.
 *
 * Categories used to be a hardcoded array in two repositories, which meant
 * adding one took a deploy of both and none of them could have a picture of its
 * own — the app's rail borrowed a photograph from whichever listing sold best,
 * so "Cement" was really one supplier's bag advertised at everyone else's
 * expense.
 *
 * Renaming carries the listings with it and hiding leaves them intact, both
 * handled server-side; this page's job is to make those consequences legible
 * before the button is pressed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/apiClient";
import {
  ImagePlus,
  Loader2,
  Plus,
  Eye,
  EyeOff,
  X,
  GripVertical,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Subcategory {
  name: string;
  isActive?: boolean;
}

interface Category {
  _id: string;
  name: string;
  image?: string | null;
  subcategories: Subcategory[];
  order: number;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ?all=true so hidden shelves are still editable — a category you cannot
      // see is one you can never bring back.
      const res = await apiGet<{ data: { categories: Category[] } }>("/categories?all=true");
      setCategories(res.data.categories);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    const name = draftName.trim();
    if (!name) return;
    try {
      await apiPost("/categories", { name });
      toast.success(`"${name}" added`);
      setDraftName("");
      setCreating(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that");
    }
  };

  const toggleVisible = async (category: Category) => {
    try {
      if (category.isActive) {
        // DELETE hides rather than removes, and reports how many listings go
        // with it — worth repeating back, because it is the surprising part.
        const res = await apiDelete<{ data: { affected: number } }>(
          `/categories/${category._id}`
        );
        const affected = res.data?.affected ?? 0;
        toast.success(
          affected
            ? `"${category.name}" hidden — ${affected} listing${affected === 1 ? "" : "s"} no longer browsable`
            : `"${category.name}" hidden`
        );
      } else {
        await apiPatch(`/categories/${category._id}`, { isActive: true });
        toast.success(`"${category.name}" is back in the shop`);
      }
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The shelves buyers browse. Renaming one moves every listing on it; hiding one
            leaves the listings intact but takes the shelf out of the app.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New category
        </button>
      </div>

      {creating && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-card">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
              if (e.key === "Escape") setCreating(false);
            }}
            placeholder="Category name, e.g. Kitchen Fittings"
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={create}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => setCreating(false)}
            className="h-10 w-10 grid place-items-center rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryRow
              key={category._id}
              category={category}
              expanded={editing === category._id}
              onExpand={() => setEditing(editing === category._id ? null : category._id)}
              onToggleVisible={() => toggleVisible(category)}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  expanded,
  onExpand,
  onToggleVisible,
  onChanged,
}: {
  category: Category;
  expanded: boolean;
  onExpand: () => void;
  onToggleVisible: () => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [subs, setSubs] = useState<string[]>(category.subcategories.map((s) => s.name));
  const [newSub, setNewSub] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset the draft whenever the row's own data changes underneath it, so a
  // reload after saving does not leave a stale name in the box.
  useEffect(() => {
    setName(category.name);
    setSubs(category.subcategories.map((s) => s.name));
  }, [category]);

  const renamed = name.trim() && name.trim() !== category.name;
  const subsChanged =
    subs.join("|") !== category.subcategories.map((s) => s.name).join("|");
  const dirty = renamed || subsChanged;

  const removedSubs = category.subcategories
    .map((s) => s.name)
    .filter((existing) => !subs.includes(existing));

  const save = async () => {
    setSaving(true);
    try {
      await apiPatch(`/categories/${category._id}`, {
        name: name.trim(),
        subcategories: subs.map((n) => ({ name: n })),
      });
      toast.success(renamed ? `Renamed, and every listing moved with it` : "Saved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiUpload<{ data: { urls: string[] } }>("/categories/image", form);
      const url = res.data.urls?.[0];
      if (!url) throw new Error("Upload returned nothing");
      await apiPatch(`/categories/${category._id}`, { image: url });
      toast.success("Artwork updated");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card transition-colors ${
        category.isActive ? "border-border" : "border-dashed border-border opacity-60"
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />

        {/* The artwork, and the button that replaces it — one target rather
            than a picture beside an upload link. */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-accent grid place-items-center group cursor-pointer"
          aria-label={`Change artwork for ${category.name}`}
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <ImagePlus className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          )}
          <span className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-background animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 text-background" strokeWidth={1.5} />
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
            if (file) pickImage(file);
            e.target.value = "";
          }}
        />

        <button onClick={onExpand} className="flex-1 min-w-0 text-left cursor-pointer">
          <p className="font-semibold text-foreground truncate">{category.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {category.subcategories.length} subcategor
            {category.subcategories.length === 1 ? "y" : "ies"}
            {!category.image && " · no artwork"}
            {!category.isActive && " · hidden"}
          </p>
        </button>

        <button
          onClick={onToggleVisible}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          aria-label={category.isActive ? `Hide ${category.name}` : `Show ${category.name}`}
          title={category.isActive ? "Hide from the shop" : "Show in the shop"}
        >
          {category.isActive ? (
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <EyeOff className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={`name-${category._id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              id={`name-${category._id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {renamed && (
              <p className="text-xs text-muted-foreground">
                Saving moves every listing filed under &ldquo;{category.name}&rdquo; to the new
                name.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Subcategories</p>
            <div className="flex flex-wrap gap-2">
              {subs.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full bg-accent text-sm text-foreground"
                >
                  {sub}
                  <button
                    onClick={() => setSubs(subs.filter((s) => s !== sub))}
                    className="h-5 w-5 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    aria-label={`Remove ${sub}`}
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const value = newSub.trim();
                  if (value && !subs.includes(value)) setSubs([...subs, value]);
                  setNewSub("");
                }}
                placeholder="Add a subcategory, then press Enter"
                className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {removedSubs.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Saving unfiles any listing currently under{" "}
                {removedSubs.map((s) => `"${s}"`).join(", ")} — the listings stay, they just
                lose the second level.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" strokeWidth={2} />
              )}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
