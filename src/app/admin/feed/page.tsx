"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Eye,
  ExternalLink,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FeedPost {
  _id: string;
  title: string;
  caption?: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  imageUrl?: string; // legacy fallback
  posterUrl?: string;
  linkUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const emptyForm = {
  title: "",
  caption: "",
  mediaType: "image" as "image" | "video",
  mediaUrl: "",
  posterUrl: "",
  linkUrl: "",
  tags: "",
  isFeatured: false,
  status: "draft",
};

export default function AdminFeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 24,
    totalPages: 1,
    totalResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { posts: FeedPost[] }; pagination: Pagination }>(
        `/admin/feed?page=${page}&limit=24`
      );
      setPosts(res.data.posts);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load feed posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
  };

  const openEdit = async (p: FeedPost) => {
    try {
      const res = await apiGet<{ data: { post: FeedPost & { tags?: string[] } } }>(
        `/admin/feed/${p._id}`
      );
      const x = res.data.post;
      setForm({
        title: x.title || "",
        caption: x.caption || "",
        mediaType: (x.mediaType as "image" | "video") || "image",
        mediaUrl: x.mediaUrl || x.imageUrl || "",
        posterUrl: x.posterUrl || "",
        linkUrl: x.linkUrl || "",
        tags: Array.isArray(x.tags) ? x.tags.join(", ") : "",
        isFeatured: !!x.isFeatured,
        status: x.status || "draft",
      });
      setEditingId(p._id);
      setShowEditor(true);
    } catch {
      toast.error("Failed to load post");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.mediaUrl.trim()) {
      toast.error("Title and media URL are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await apiPatch(`/admin/feed/${editingId}`, payload);
        toast.success("Post updated");
      } else {
        await apiPost("/admin/feed", payload);
        toast.success("Post created");
      }
      setShowEditor(false);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feed post?")) return;
    try {
      await apiDelete(`/admin/feed/${id}`);
      toast.success("Deleted");
      fetchPosts(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggleFeatured = async (p: FeedPost) => {
    try {
      await apiPatch(`/admin/feed/${p._id}`, { isFeatured: !p.isFeatured });
      toast.success(p.isFeatured ? "Unpinned" : "Pinned to top");
      fetchPosts(pagination.page);
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Feed CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pinterest-style pins surfaced on the public feed alongside artisan portfolio items.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Pin
        </button>
      </div>

      {/* Pin grid (mirrors the public feed's masonry feel) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <Skeleton className="w-full aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
          <p className="font-medium text-foreground">No pins yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first pin to seed the public feed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((p) => (
            <PinAdminCard
              key={p._id}
              post={p}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p._id)}
              onToggleFeatured={() => handleToggleFeatured(p)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} posts total</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <PinEditorModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          saving={saving}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ── Admin pin card (list view) ────────────────────────────────────────────

function PinAdminCard({
  post,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  post: FeedPost;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}) {
  const url = post.mediaUrl || post.imageUrl || "";
  const isVideo = post.mediaType === "video";

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-secondary">
        {isVideo ? (
          <video
            src={url}
            poster={post.posterUrl || undefined}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={post.title} className="w-full h-full object-cover" />
        )}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {post.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow w-fit ${
              isVideo ? "bg-black/70 text-white" : "bg-white/95 text-foreground"
            }`}
          >
            {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {isVideo ? "Video" : "Image"}
          </span>
        </div>

        {/* Top-right status pill */}
        <span
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow capitalize ${
            post.status === "published"
              ? "bg-green-500/90 text-white"
              : "bg-yellow-500/90 text-white"
          }`}
        >
          {post.status}
        </span>

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onToggleFeatured}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow transition-colors ${
              post.isFeatured
                ? "bg-foreground text-background"
                : "bg-white/95 text-foreground hover:bg-white"
            }`}
            title={post.isFeatured ? "Unpin" : "Pin to top"}
          >
            <Star
              className={`w-3.5 h-3.5 inline-block mr-1 ${post.isFeatured ? "fill-current" : ""}`}
            />
            {post.isFeatured ? "Pinned" : "Pin"}
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-full bg-white/95 text-foreground text-xs font-semibold hover:bg-white shadow transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 inline-block mr-1" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 shadow transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 inline-block mr-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="p-3 flex-1">
        <p className="font-medium text-foreground text-sm line-clamp-2">{post.title}</p>
        {post.caption && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.caption}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Editor modal with live preview + media type toggle ───────────────────

function PinEditorModal({
  form,
  setForm,
  editingId,
  saving,
  onClose,
  onSave,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  editingId: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-foreground">
            {editingId ? "Edit pin" : "New pin"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
          {/* Left — Form */}
          <div className="overflow-y-auto p-5 space-y-4 border-r border-border">
            {/* Media type toggle */}
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Media type
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mediaType: "image" }))}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.mediaType === "image"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Image
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mediaType: "video" }))}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.mediaType === "video"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {form.mediaType === "video" ? "Video URL" : "Image URL"}
              </label>
              <input
                value={form.mediaUrl}
                onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={
                  form.mediaType === "video"
                    ? "https://…/clip.mp4"
                    : "https://…/photo.jpg"
                }
              />
              {form.mediaType === "video" && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Direct video file URL (.mp4, .webm). Hosted videos (YouTube, Vimeo) won&apos;t embed.
                </p>
              )}
            </div>

            {form.mediaType === "video" && (
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Poster image{" "}
                  <span className="opacity-70 normal-case">(optional)</span>
                </label>
                <input
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                  placeholder="https://…/cover.jpg"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Pin title"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Caption
              </label>
              <textarea
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Short caption shown in the detail modal"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Link URL <span className="opacity-70 normal-case">(optional)</span>
              </label>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                placeholder="/products?category=Tiles"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Tags
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                  placeholder="market, tips"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border bg-secondary/30">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Pin to top
                </p>
                <p className="text-xs text-muted-foreground">
                  Featured pins appear first in the public feed.
                </p>
              </div>
            </label>
          </div>

          {/* Right — Live preview */}
          <div className="overflow-y-auto p-5 bg-secondary/20">
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" /> Live preview
            </div>
            <div className="max-w-[280px] mx-auto">
              <PinPreview form={form} />
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              This is roughly how the pin will appear in the public masonry feed.
            </p>
          </div>
        </div>

        <div className="shrink-0 p-5 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : editingId ? "Update pin" : "Create pin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Live preview card (mirrors public feed card minus interactions) ────────

function PinPreview({ form }: { form: typeof emptyForm }) {
  const hasMedia = form.mediaUrl.trim().length > 0;
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <div className="relative bg-secondary aspect-square overflow-hidden">
        {hasMedia ? (
          form.mediaType === "video" ? (
            <video
              src={form.mediaUrl}
              poster={form.posterUrl || undefined}
              className="w-full h-full object-cover"
              muted
              playsInline
              onError={(e) => ((e.target as HTMLVideoElement).style.display = "none")}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.mediaUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Media preview
          </div>
        )}

        {form.isFeatured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}
        {form.mediaType === "video" && hasMedia && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
            <Video className="w-3 h-3" /> Video
          </span>
        )}
        {form.linkUrl && hasMedia && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 text-foreground text-xs font-medium shadow">
            <ExternalLink className="w-3 h-3" /> Visit
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-foreground text-sm line-clamp-2">
          {form.title || "Pin title"}
        </p>
        {form.caption && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.caption}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">Sintherior</p>
      </div>
    </div>
  );
}
