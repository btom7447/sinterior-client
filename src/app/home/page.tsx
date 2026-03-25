"use client";

import AppLayout from "@/components/layout/AppLayout";
import PinterestFeed from "@/components/home/PinterestFeed";
import { Search } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [query, setQuery] = useState("");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for artisans, products, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
          />
        </div>
      </div>
      <PinterestFeed />
    </AppLayout>
  );
}
