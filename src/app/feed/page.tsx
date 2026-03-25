"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle2 } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Emmanuel Okonkwo",
        role: "Master Electrician",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        verified: true,
      },
      content: "Just completed a full electrical installation for a 5-bedroom duplex in Lekki. Quality work speaks for itself! 💪⚡",
      images: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      ],
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: "2 hours ago",
      liked: false,
      saved: false,
    },
    {
      id: 2,
      author: {
        name: "TileHub Express",
        role: "Building Materials Supplier",
        avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80",
        verified: true,
      },
      content: "New stock alert! 🎉 Premium Italian marble tiles now available. Limited quantity - first come, first served! DM for prices.",
      images: [
        "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80",
      ],
      likes: 156,
      comments: 89,
      shares: 34,
      timestamp: "4 hours ago",
      liked: false,
      saved: false,
    },
    {
      id: 3,
      author: {
        name: "Chidinma Eze",
        role: "Interior Painter",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        verified: true,
      },
      content: "Before & After transformation of this living room in Abuja. Client wanted a modern, warm feel and we delivered! 🎨✨",
      images: [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      ],
      likes: 312,
      comments: 67,
      shares: 28,
      timestamp: "6 hours ago",
      liked: true,
      saved: true,
    },
    {
      id: 4,
      author: {
        name: "BuildMart Supplies",
        role: "Construction Materials",
        avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80",
        verified: true,
      },
      content: "Weekend Special! 🔥 Get 10% off all cement purchases. Use code: BUILD10. Offer valid till Sunday. Delivery available in Lagos!",
      images: [
        "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80",
      ],
      likes: 89,
      comments: 23,
      shares: 45,
      timestamp: "8 hours ago",
      liked: false,
      saved: false,
    },
  ]);

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const toggleSave = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, saved: !post.saved } : post
    ));
  };

  return (
    <AppLayout>
      <main className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Feed</h1>
          <p className="text-muted-foreground">
            Discover work, products, and updates from the community
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="card-elevated p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                      {post.author.verified && (
                        <CheckCircle2 strokeWidth={1} className="w-4 h-4 text-success fill-success/20" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{post.author.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal strokeWidth={1} className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

              {post.images.length > 0 && (
                <div className={`grid gap-2 mb-4 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="w-full h-48 sm:h-56 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={post.liked ? "text-destructive" : "text-muted-foreground"}
                  >
                    <Heart strokeWidth={1} className={`w-5 h-5 mr-1.5 ${post.liked ? "fill-current" : ""}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle strokeWidth={1} className="w-5 h-5 mr-1.5" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 strokeWidth={1} className="w-5 h-5 mr-1.5" />
                    {post.shares}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSave(post.id)}
                  className={post.saved ? "text-primary" : "text-muted-foreground"}
                >
                  <Bookmark strokeWidth={1} className={`w-5 h-5 ${post.saved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </AppLayout>
  );
}
