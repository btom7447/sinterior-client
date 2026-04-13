"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Lightbulb,
  LayoutGrid,
  Wallpaper,
  DoorOpen,
  Layers,
  Hammer,
  Car,
  Home,
  Cpu,
  Sofa,
  WashingMachine,
  Flame,
  Wrench as WrenchIcon,
  Zap,
  Paintbrush,
  Package,
} from "lucide-react";
import { PRODUCT_CATEGORY_TREE } from "@/lib/constants";

export interface CategoryItem {
  name: string;
  icon?: React.ElementType;
  children?: string[];
}

/** Map category names to icons */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Lightings & Electrical": Lightbulb,
  "Panels": LayoutGrid,
  "Wallpaper": Wallpaper,
  "Doors": DoorOpen,
  "Walls": Layers,
  "Cement": Package,
  "Steel & Iron": Hammer,
  "Tiles & Flooring": LayoutGrid,
  "Paints": Paintbrush,
  "Roofing & Ceiling": Home,
  "Smart Home": Cpu,
  "Furniture": Sofa,
  "Plumbing": WrenchIcon,
  "Aggregates": Package,
  "Wood & Timber": Hammer,
  "Automobile": Car,
  "Laundromat": WashingMachine,
};

/** Built from the shared PRODUCT_CATEGORY_TREE — single source of truth */
const defaultCategories: CategoryItem[] = [
  { name: "For you", icon: Home },
  { name: "Featured", icon: Flame },
  { name: "Deals", icon: Zap },
  ...PRODUCT_CATEGORY_TREE.map((cat) => ({
    name: cat.name,
    icon: CATEGORY_ICONS[cat.name] || Package,
    children: cat.subcategories.length > 0 ? cat.subcategories : undefined,
  })),
];

interface CategorySidebarProps {
  categories?: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

const CategorySidebar = ({ selected, onSelect }: CategorySidebarProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <nav className="w-full min-w-44 shrink-0 bg-card">
      <div className="py-2">
        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </p>
        {defaultCategories.map((cat) => {
          const isActive = selected === cat.name;
          const isExpanded = expanded.has(cat.name);
          const hasChildren = cat.children && cat.children.length > 0;
          const Icon = cat.icon;

          return (
            <div key={cat.name}>
              <button
                onClick={() => {
                  onSelect(cat.name);
                  if (hasChildren) toggleExpand(cat.name);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border-l-3 border-l-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border-l-3 border-l-transparent"
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" strokeWidth={1} />}
                <span className="flex-1 text-left truncate">{cat.name}</span>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                    strokeWidth={1}
                  />
                )}
              </button>

              {/* Sub-items */}
              {hasChildren && isExpanded && (
                <div className="bg-secondary/30">
                  {cat.children!.map((child) => {
                    const childActive = selected === child;
                    return (
                      <button
                        key={child}
                        onClick={() => onSelect(child)}
                        className={cn(
                          "w-full text-left pl-10 pr-4 py-2 text-xs transition-colors",
                          childActive
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        {child}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default CategorySidebar;
