"use client";

import { use, useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  tags: string[];
  author: { fullName: string; avatarUrl: string | null };
  publishedAt: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await apiGet<{ data: { post: BlogPost } }>(`/blog/${slug}`);
        setPost(res.data.post);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !post) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-lg text-muted-foreground">Post not found</p>
          <Link href="/blog" className="text-primary text-sm hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {post.coverImage && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {post.author?.fullName || "Sintherior"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.publishedAt).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <hr className="border-border my-8" />

        <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {post.body}
        </article>
      </div>
    </AppLayout>
  );
}
