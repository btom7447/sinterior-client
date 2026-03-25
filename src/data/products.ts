export interface Product {
  id: number;
  image: string;
  images: string[];
  name: string;
  category: string;
  price: string;
  unit: string;
  supplier: string;
  supplierAvatar: string;
  supplierWhatsapp?: string;
  supplierShopImage?: string;
  location: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  description: string;
  specs: Record<string, string>;
  reviewsList: { user: string; avatar: string; rating: number; comment: string; date: string }[];
}

export const products: Product[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80",
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80",
      "https://images.unsplash.com/photo-1590247813693-5541d1c573a2?w=800&q=80",
    ],
    name: "Dangote Cement (50kg)",
    category: "Cement",
    price: "₦5,500",
    unit: "per bag",
    supplier: "BuildMart Supplies",
    supplierAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80",
    supplierWhatsapp: "2348012345678",
    supplierShopImage: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
    location: "Lagos",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    badge: "Best Seller",
    description: "Premium quality Dangote cement, ideal for all types of construction projects. This 50kg bag delivers exceptional binding strength and durability for foundations, pillars, slabs, and general masonry work.",
    specs: {
      "Weight": "50 kg",
      "Type": "Ordinary Portland Cement (OPC)",
      "Grade": "42.5R",
      "Setting Time": "45 mins (initial)",
      "Compressive Strength": "42.5 MPa (28 days)",
      "Shelf Life": "3 months",
      "Color": "Grey",
    },
    reviewsList: [
      { user: "Adebayo K.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", rating: 5, comment: "Excellent cement quality, sets perfectly every time. I've used it on 3 projects now.", date: "2 weeks ago" },
      { user: "Chinwe O.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", rating: 5, comment: "Best cement in the market. Quick delivery too!", date: "1 month ago" },
      { user: "Ibrahim M.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", rating: 4, comment: "Good quality but a bit pricey compared to alternatives.", date: "1 month ago" },
    ],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
      "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=800&q=80",
    ],
    name: "Steel Reinforcement Bars (12mm)",
    category: "Steel & Iron",
    price: "₦385,000",
    unit: "per ton",
    supplier: "MetalWorks Nigeria",
    supplierAvatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&q=80",
    location: "Ogun",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    description: "High-quality 12mm steel reinforcement bars suitable for structural concrete work. Meets BS 4449 standards for construction-grade reinforcement.",
    specs: {
      "Diameter": "12mm",
      "Length": "12 meters",
      "Grade": "BS 4449 Grade 500B",
      "Yield Strength": "500 N/mm²",
      "Type": "High Yield Deformed Bar",
      "Finish": "Mill finish",
    },
    reviewsList: [
      { user: "Emeka C.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", rating: 5, comment: "Consistent quality bars. No bending issues.", date: "3 weeks ago" },
      { user: "Tunde A.", avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&q=80", rating: 4, comment: "Good quality, delivery was on time.", date: "2 months ago" },
    ],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    name: "Premium Italian Floor Tiles",
    category: "Tiles & Flooring",
    price: "₦8,200",
    unit: "per sqm",
    supplier: "TileHub Express",
    supplierAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    location: "Abuja",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    badge: "Premium",
    description: "Elegant Italian porcelain floor tiles with a polished finish. Perfect for living rooms, kitchens, and commercial spaces. Scratch-resistant and easy to maintain.",
    specs: {
      "Size": "60cm x 60cm",
      "Material": "Porcelain",
      "Finish": "Polished / Glossy",
      "Thickness": "10mm",
      "Water Absorption": "< 0.5%",
      "Slip Rating": "R9",
      "Origin": "Italy",
    },
    reviewsList: [
      { user: "Amaka N.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", rating: 5, comment: "Absolutely stunning tiles! My living room looks like a palace now.", date: "1 week ago" },
      { user: "David O.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", rating: 5, comment: "Premium quality, worth every naira. Beautiful finish.", date: "3 weeks ago" },
    ],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
      "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80",
    ],
    name: "Emulsion Paint (20L Bucket)",
    category: "Paints",
    price: "₦18,500",
    unit: "per bucket",
    supplier: "ColorCraft Paints",
    supplierAvatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&q=80",
    location: "Lagos",
    rating: 4.5,
    reviews: 67,
    inStock: true,
    description: "Smooth matt emulsion paint for interior walls and ceilings. Low odour, quick drying, and provides excellent coverage with a washable finish.",
    specs: {
      "Volume": "20 Litres",
      "Type": "Vinyl Matt Emulsion",
      "Coverage": "10-12 sqm/litre",
      "Drying Time": "2-4 hours",
      "Coats": "2 recommended",
      "Finish": "Matt",
      "VOC Level": "Low",
    },
    reviewsList: [
      { user: "Grace E.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", rating: 5, comment: "Smooth application, no streaks. Love it!", date: "2 weeks ago" },
    ],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    ],
    name: "Granite Chippings (1 Ton)",
    category: "Aggregates",
    price: "₦45,000",
    unit: "per ton",
    supplier: "QuarryDirect NG",
    supplierAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    location: "Ogun",
    rating: 4.3,
    reviews: 42,
    inStock: true,
    description: "High-quality granite chippings for concrete mixing, road construction, and landscaping. Clean, well-graded aggregate suitable for structural work.",
    specs: {
      "Size": "12mm - 19mm",
      "Type": "Crushed Granite",
      "Weight": "1 Ton (1000 kg)",
      "Color": "Grey / Dark Grey",
      "Application": "Concrete, Roads, Landscaping",
    },
    reviewsList: [
      { user: "John B.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", rating: 4, comment: "Good quality aggregate. Clean and well graded.", date: "1 month ago" },
    ],
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    ],
    name: "Electrical Cable (2.5mm, 100m)",
    category: "Electrical",
    price: "₦32,000",
    unit: "per roll",
    supplier: "PowerLine Electricals",
    supplierAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    location: "Lagos",
    rating: 4.7,
    reviews: 98,
    inStock: true,
    badge: "New Arrival",
    description: "Premium quality 2.5mm single core copper cable. Suitable for lighting and power circuits in residential and commercial buildings. PVC insulated and sheathed.",
    specs: {
      "Size": "2.5mm²",
      "Length": "100 meters",
      "Core": "Single Core Copper",
      "Insulation": "PVC",
      "Voltage Rating": "450/750V",
      "Standard": "NIS / IEC",
      "Color": "Available in multiple colors",
    },
    reviewsList: [
      { user: "Samuel D.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", rating: 5, comment: "Genuine copper cable, flexible and easy to work with.", date: "1 week ago" },
      { user: "Paul I.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", rating: 4, comment: "Good quality cable. Fair pricing too.", date: "3 weeks ago" },
    ],
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1585128792020-803d29415281?w=800&q=80",
    ],
    name: "PVC Pipes (4 inch, bundle)",
    category: "Plumbing",
    price: "₦28,000",
    unit: "per bundle",
    supplier: "AquaFix Supplies",
    supplierAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    location: "Ibadan",
    rating: 4.4,
    reviews: 31,
    inStock: false,
    description: "Durable 4-inch PVC pressure pipes for water supply and drainage systems. UV resistant and long-lasting with smooth internal bore for optimal flow.",
    specs: {
      "Diameter": "4 inches (110mm)",
      "Length": "6 meters per pipe",
      "Bundle": "10 pipes",
      "Pressure Rating": "6 bar",
      "Material": "Unplasticised PVC (uPVC)",
      "Standard": "NIS 230",
    },
    reviewsList: [
      { user: "Victor A.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", rating: 4, comment: "Solid pipes, but delivery took longer than expected.", date: "2 months ago" },
    ],
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    ],
    name: "Plywood Board (8x4 ft)",
    category: "Wood & Timber",
    price: "₦12,500",
    unit: "per sheet",
    supplier: "TimberLand Nigeria",
    supplierAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    location: "Benin",
    rating: 4.6,
    reviews: 73,
    inStock: true,
    description: "High-grade plywood board suitable for furniture making, interior panelling, and general construction. Smooth finish on both sides with excellent structural integrity.",
    specs: {
      "Size": "8 x 4 feet (2440 x 1220mm)",
      "Thickness": "18mm",
      "Type": "Hardwood Plywood",
      "Layers": "Multi-ply",
      "Finish": "Sanded both sides",
      "Grade": "BB/CC",
    },
    reviewsList: [
      { user: "Kehinde T.", avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&q=80", rating: 5, comment: "Great quality plywood. Perfect for my furniture project.", date: "2 weeks ago" },
      { user: "Rita O.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", rating: 4, comment: "Good board, smooth finish. Would buy again.", date: "1 month ago" },
    ],
  },
];
