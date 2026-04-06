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

export interface CategoryItem {
  name: string;
  icon?: React.ElementType;
  children?: string[];
}

const defaultCategories: CategoryItem[] = [
  { name: "For you", icon: Home },
  { name: "Featured", icon: Flame },
  { name: "Deals", icon: Zap },
  {
    name: "Lightings & Electrical",
    icon: Lightbulb,
    children: ["LED Lights", "Chandeliers", "Switches & Sockets", "Cables"],
  },
  {
    name: "Panels",
    icon: LayoutGrid,
    children: ["Wall Panels", "Ceiling Panels", "Acoustic Panels"],
  },
  {
    name: "Wallpaper",
    icon: Wallpaper,
    children: ["Vinyl", "Fabric", "Peel & Stick", "3D Wallpaper"],
  },
  {
    name: "Doors",
    icon: DoorOpen,
    children: ["Wooden Doors", "Steel Doors", "Glass Doors", "PVC Doors"],
  },
  {
    name: "Walls",
    icon: Layers,
    children: ["Paint", "Tiles", "Bricks", "Plaster"],
  },
  {
    name: "Cement",
    icon: Package,
    children: ["Dangote", "BUA", "Lafarge"],
  },
  {
    name: "Steel & Iron",
    icon: Hammer,
    children: ["Reinforcement Bars", "Roofing Sheets", "Nails & Bolts"],
  },
  {
    name: "Tiles & Flooring",
    icon: LayoutGrid,
    children: ["Ceramic", "Porcelain", "Granite", "Marble", "Vinyl"],
  },
  {
    name: "Paints",
    icon: Paintbrush,
    children: ["Emulsion", "Gloss", "Textured", "Primers"],
  },
  {
    name: "Roofing & Ceiling",
    icon: Home,
    children: ["Long Span", "Step Tiles", "POP Ceiling", "PVC Ceiling"],
  },
  {
    name: "Smart Home",
    icon: Cpu,
    children: ["Automation", "CCTV", "Smart Locks", "Sensors"],
  },
  {
    name: "Furniture",
    icon: Sofa,
    children: ["Kitchen", "Bedroom", "Office", "Outdoor"],
  },
  {
    name: "Plumbing",
    icon: WrenchIcon,
    children: ["Pipes", "Fittings", "Taps", "Water Heaters"],
  },
  {
    name: "Aggregates",
    icon: Package,
    children: ["Sand", "Gravel", "Granite Chippings"],
  },
  {
    name: "Wood & Timber",
    icon: Hammer,
    children: ["Planks", "Plywood", "MDF", "Hardwood"],
  },
  {
    name: "Automobile",
    icon: Car,
  },
  {
    name: "Laundromat",
    icon: WashingMachine,
  },
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
    <nav className="w-full min-w-[11rem] shrink-0 bg-card overflow-y-auto">
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
