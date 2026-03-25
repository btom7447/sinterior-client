"use client";
import { Heart, MessageCircle, Bookmark, Share2, CheckCircle2, MapPin } from "lucide-react";
import { useState } from "react";

interface FeedItem {
  id: number;
  image: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  location: string;
  likes: number;
  comments: number;
  category: string;
  verified: boolean;
}

const feedItems: FeedItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    title: "Modern 4-Bedroom Duplex Completed",
    description: "Just finished this luxury duplex in Lekki. 6 months of dedicated work.",
    author: "Emmanuel Okonkwo",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    authorRole: "Master Builder",
    location: "Lagos",
    likes: 234,
    comments: 45,
    category: "Projects",
    verified: true,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80",
    title: "Premium Italian Tiles Now Available",
    description: "New stock just arrived. Best prices in the market.",
    author: "TileHub Express",
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    authorRole: "Supplier",
    location: "Abuja",
    likes: 89,
    comments: 12,
    category: "Products",
    verified: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    title: "Electrical Rewiring for Commercial Plaza",
    description: "Complete electrical overhaul of a 3-storey commercial building. Safety first!",
    author: "Adebayo Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    authorRole: "Electrician",
    location: "Port Harcourt",
    likes: 156,
    comments: 28,
    category: "Services",
    verified: true,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    title: "Stunning Kitchen Renovation",
    description: "Transformed this outdated kitchen into a modern masterpiece.",
    author: "Chidinma Eze",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    authorRole: "Interior Designer",
    location: "Lagos",
    likes: 312,
    comments: 67,
    category: "Projects",
    verified: true,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80",
    title: "Dangote Cement – Wholesale Prices",
    description: "Direct from warehouse. Minimum order: 100 bags. Delivery available.",
    author: "BuildMart Supplies",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80",
    authorRole: "Supplier",
    location: "Kano",
    likes: 67,
    comments: 8,
    category: "Products",
    verified: false,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
    title: "Living Room Makeover – Before & After",
    description: "Client wanted a warm, contemporary feel. Delivered in 3 weeks.",
    author: "Ngozi Amadi",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    authorRole: "Interior Painter",
    location: "Enugu",
    likes: 445,
    comments: 92,
    category: "Projects",
    verified: true,
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
    title: "Steel Reinforcement – Grade 60",
    description: "High-quality reinforcement bars for structural integrity. Various sizes available.",
    author: "MetalWorks Nigeria",
    authorAvatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&q=80",
    authorRole: "Supplier",
    location: "Ogun",
    likes: 42,
    comments: 5,
    category: "Products",
    verified: true,
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    title: "5-Storey Office Complex – Structural Work",
    description: "Handling the complete structural framework. On schedule for Q3 delivery.",
    author: "Ifeanyi Construction",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    authorRole: "Contractor",
    location: "Lagos",
    likes: 198,
    comments: 34,
    category: "Real Estate",
    verified: true,
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80",
    title: "Exterior Painting – Luxury Villa",
    description: "Weather-resistant finish that lasts. Premium brands only.",
    author: "ColorCraft Paints",
    authorAvatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&q=80",
    authorRole: "Painter",
    location: "Abuja",
    likes: 123,
    comments: 19,
    category: "Services",
    verified: false,
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    title: "Luxury 3-Bed Apartment for Sale",
    description: "Brand new, fully furnished. Prime location with 24/7 security.",
    author: "Prime Realty NG",
    authorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80",
    authorRole: "Real Estate",
    location: "Lagos",
    likes: 521,
    comments: 78,
    category: "Real Estate",
    verified: true,
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80",
    title: "Plumbing Installation – New Estate",
    description: "Full plumbing setup for 20-unit housing estate. Professional standards.",
    author: "AquaFix Plumbing",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    authorRole: "Plumber",
    location: "Ibadan",
    likes: 87,
    comments: 14,
    category: "Services",
    verified: true,
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    title: "Gated Community – Phase 2 Launch",
    description: "Affordable luxury living. Plots and homes available. Flexible payment plans.",
    author: "Greenfield Estates",
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    authorRole: "Developer",
    location: "Abuja",
    likes: 334,
    comments: 56,
    category: "Real Estate",
    verified: true,
  },
];

const categories = ["All", "Projects", "Products", "Services", "Real Estate"];

interface FeedCardProps {
  item: FeedItem;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
}

const FeedCard = ({ item, isLiked, isSaved, onLike, onSave }: FeedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="break-inside-avoid rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img src={item.image} alt={item.title} className="w-full object-cover" loading="lazy" />
        <div
          className={`absolute inset-0 bg-foreground/40 flex items-end p-3 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isSaved ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-card/90"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="font-display font-semibold text-foreground text-sm leading-tight mb-1.5 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex items-center gap-2 mb-2.5">
          <img src={item.authorAvatar} alt={item.author} className="w-7 h-7 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground truncate">{item.author}</span>
              {item.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-[11px]">{item.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2.5 border-t border-border/50">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
            <span>{isLiked ? item.likes + 1 : item.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{item.comments}</span>
          </button>
          <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PinterestFeed = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());

  const filteredItems =
    activeCategory === "All" ? feedItems : feedItems.filter((item) => item.category === activeCategory);

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {filteredItems.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            isLiked={likedItems.has(item.id)}
            isSaved={savedItems.has(item.id)}
            onLike={() => toggleLike(item.id)}
            onSave={() => toggleSave(item.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default PinterestFeed;
