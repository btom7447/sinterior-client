import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

const featured = {
  slug: "how-to-hire-verified-artisans-nigeria",
  title: "How to Hire Verified Artisans in Nigeria Without Getting Burned",
  excerpt:
    "We break down what to look for when hiring a builder, plumber, or electrician — and how Sintherior's verification process protects you.",
  category: "Guides",
  date: "March 20, 2026",
  readTime: "7 min read",
  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",
  author: { name: "Chioma Okafor", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80" },
};

const posts = [
  {
    slug: "construction-materials-price-guide-2026",
    title: "Construction Materials Price Guide — Q1 2026",
    excerpt: "Updated pricing for cement, iron rods, roofing sheets, and tiles across major Nigerian cities.",
    category: "Market",
    date: "March 15, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80",
  },
  {
    slug: "artisan-profile-tips",
    title: "5 Ways to Make Your Artisan Profile Stand Out",
    excerpt: "Simple changes to your Sintherior profile that lead to more client inquiries and higher rates.",
    category: "Tips",
    date: "March 10, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
  },
  {
    slug: "real-estate-trends-lagos-2026",
    title: "Real Estate Trends Shaping Lagos in 2026",
    excerpt: "Demand patterns, pricing shifts, and the neighbourhoods getting the most attention from buyers and renters.",
    category: "Real Estate",
    date: "March 5, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
  },
  {
    slug: "supplier-verification-process",
    title: "Inside Sintherior's Supplier Verification Process",
    excerpt: "A behind-the-scenes look at how we vet every supplier before they can list products on the platform.",
    category: "Platform",
    date: "Feb 28, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80",
  },
  {
    slug: "building-in-the-dry-season",
    title: "Why the Dry Season Is the Best Time to Build in Nigeria",
    excerpt: "Practical advice on scheduling your construction project to take advantage of Harmattan conditions.",
    category: "Guides",
    date: "Feb 20, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
];

const categories = ["All", "Guides", "Market", "Real Estate", "Platform", "Tips"];

export default function BlogPage() {
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
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Featured post */}
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="grid lg:grid-cols-2 gap-8 card-interactive p-0 overflow-hidden rounded-2xl">
              <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  Featured · {featured.category}
                </span>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4">
                  <img src={featured.author.avatar} alt={featured.author.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{featured.author.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {featured.date} · <Clock strokeWidth={1} className="w-3 h-3" /> {featured.readTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group card-interactive overflow-hidden rounded-2xl p-0 block">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-foreground px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {post.date} · <Clock strokeWidth={1} className="w-3 h-3" /> {post.readTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Load more posts <ArrowRight strokeWidth={1} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
