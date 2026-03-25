"use client";

import { Menu } from "lucide-react";

export default function DashboardComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Menu className="w-8 h-8 text-primary" strokeWidth={1} />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground mb-2">Coming Soon</h2>
      <p className="text-muted-foreground">This section is under development.</p>
    </div>
  );
}
