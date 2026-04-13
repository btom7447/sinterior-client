"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Clock } from "lucide-react";
import { apiGet } from "@/lib/apiClient";

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  author?: {
    fullName?: string;
    avatarUrl?: string | null;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("All");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ data: { posts: BlogPost[] } }>("/blog?limit=30");
        setPosts(res.data.posts);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));
  const categories = ["All", ...allTags];
  const visible =
    category === "All" ? posts : posts.filter((p) => p.tags?.includes(category));
  const featured = visible[0];
  const rest = visible.slice(1);

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  const readTime = (excerpt: string) => `${Math.max(2, Math.ceil((excerpt || "").split(" ").length / 40))} min read`;

  return (
    <AppLayout>
      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="max-w-7xl mx-auto">
          <span className="badge-role mb-4 inline-block">Blog</span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Stories & <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-muted-foreground max-w-sm">
              Guides, market updates, and news from the Sintherior team.
            </p>
          </div>

          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex gap-2 mt-8 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                    cat === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-12">Loading...</p>
          ) : visible.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No posts yet.</p>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                  <div className="grid lg:grid-cols-2 gap-8 card-interactive p-0 overflow-hidden rounded-2xl">
                    <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-secondary">
                      {featured.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      {featured.tags?.[0] && (
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                          Featured · {featured.tags[0]}
                        </span>
                      )}
                      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center gap-4">
                        {featured.author?.avatarUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featured.author.avatarUrl}
                            alt={featured.author.fullName || ""}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          {featured.author?.fullName && (
                            <p className="text-sm font-medium text-foreground">
                              {featured.author.fullName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {formatDate(featured.publishedAt || featured.createdAt)} ·{" "}
                            <Clock strokeWidth={1} className="w-3 h-3" /> {readTime(featured.excerpt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Post grid */}
              {rest.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group card-interactive overflow-hidden rounded-2xl p-0 block"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                        {post.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {post.tags?.[0] && (
                          <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-foreground px-2.5 py-1 rounded-full capitalize">
                            {post.tags[0]}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {formatDate(post.publishedAt || post.createdAt)} ·{" "}
                          <Clock strokeWidth={1} className="w-3 h-3" /> {readTime(post.excerpt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
