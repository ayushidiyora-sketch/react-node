import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export type Product = {
  id: number;
  backendId?: string;
  wishlistItemId?: string;
  galleryImages?: string[];
  sellerName?: string;
  sellerProfileImage?: string;
  brandName?: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  badge?: "new" | "popular" | null;
  stock?: number;
  rating: number;
  shortDescription: string;
  description: string;
  specifications: Array<{
    label: string;
    value: string;
  }>;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "wireless-bluetooth-earbuds-pro-max",
    name: "Wireless Bluetooth Earbuds Pro Max",
    category: "Audio",
    image: product1,
    originalPrice: 27.27,
    salePrice: 18.73,
    stock: 20,
    rating: 4.5,
    shortDescription: "Compact true-wireless earbuds with deep bass and all-day comfort.",
    description: "These wireless earbuds pair fast, isolate background noise, and deliver balanced sound for commuting, calls, and workouts. The compact charging case slips into any pocket while the soft silicone tips keep the fit secure for longer listening sessions.",
    specifications: [
      { label: "Battery", value: "24 hours with case" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Noise Control", value: "Passive isolation" },
      { label: "Charging", value: "USB-C fast charge" },
    ],
  },
  {
    id: 2,
    slug: "smart-watch-fitness-tracker-band",
    name: "Smart Watch Fitness Tracker Band",
    category: "Wearables",
    image: product2,
    originalPrice: 24.55,
    salePrice: 17.79,
    badge: "popular",
    rating: 4.8,
    shortDescription: "A lightweight fitness watch with sleep, heart-rate, and activity tracking.",
    description: "Track daily movement, workouts, sleep quality, and smart notifications from a single wrist companion. The bright display stays readable outdoors and the lightweight band is comfortable enough for full-day wear.",
    specifications: [
      { label: "Display", value: "1.7 inch touch display" },
      { label: "Sensors", value: "Heart rate and sleep monitor" },
      { label: "Water Resistance", value: "IP68" },
      { label: "Battery", value: "Up to 10 days" },
    ],
  },
  {
    id: 3,
    slug: "rgb-gaming-mouse-ergonomic-design",
    name: "RGB Gaming Mouse Ergonomic Design",
    category: "Gaming",
    image: product3,
    originalPrice: 32.63,
    salePrice: 18.03,
    stock: 48,
    rating: 4.2,
    shortDescription: "Ergonomic gaming mouse with adjustable DPI and responsive switches.",
    description: "Designed for competitive sessions, this gaming mouse offers low-latency tracking, tactile clicks, and contouring that reduces hand fatigue. Custom RGB zones and programmable buttons let players tailor the setup to their style.",
    specifications: [
      { label: "Sensor", value: "Up to 12,000 DPI" },
      { label: "Buttons", value: "7 programmable buttons" },
      { label: "Lighting", value: "RGB multi-zone" },
      { label: "Connection", value: "Wired USB" },
    ],
  },
  {
    id: 4,
    slug: "portable-bluetooth-speaker-mini",
    name: "Portable Bluetooth Speaker Mini",
    category: "Audio",
    image: product4,
    originalPrice: 20.64,
    salePrice: 15.61,
    stock: 12,
    rating: 4,
    shortDescription: "Pocket-sized speaker with punchy sound and dependable wireless playback.",
    description: "This mini Bluetooth speaker is tuned for casual listening indoors or outdoors. It pairs quickly, resists splashes, and provides clear vocals with surprising low-end depth for its compact form.",
    specifications: [
      { label: "Output", value: "10W stereo sound" },
      { label: "Battery", value: "8 hours" },
      { label: "Protection", value: "Splash resistant" },
      { label: "Range", value: "10 meters" },
    ],
  },
  {
    id: 5,
    slug: "mechanical-gaming-keyboard-rgb",
    name: "Mechanical Gaming Keyboard RGB",
    category: "Gaming",
    image: product5,
    originalPrice: 39.27,
    salePrice: 28.42,
    rating: 4.7,
    shortDescription: "Full mechanical keyboard with crisp switches and customizable lighting.",
    description: "A solid aluminum-backed keyboard built for precise feedback and long sessions. Anti-ghosting support, media shortcuts, and vibrant RGB presets make it a reliable centerpiece for work and gaming setups.",
    specifications: [
      { label: "Switch Type", value: "Blue mechanical" },
      { label: "Layout", value: "104-key full size" },
      { label: "Lighting", value: "Per-key RGB" },
      { label: "Cable", value: "Detachable USB-C" },
    ],
  },
  {
    id: 6,
    slug: "wireless-over-ear-headphones",
    name: "Wireless Over-Ear Headphones",
    category: "Audio",
    image: product6,
    originalPrice: 36.9,
    salePrice: 24.43,
    badge: "new",
    rating: 4.6,
    shortDescription: "Comfort-first headphones with rich audio and long battery life.",
    description: "These over-ear headphones feature plush earcups, stable wireless performance, and a warm sound profile for music, streaming, and remote calls. Fold-flat hinges make them easy to carry between home and office.",
    specifications: [
      { label: "Battery", value: "30 hours playback" },
      { label: "Microphone", value: "Dual beamforming mics" },
      { label: "Connection", value: "Bluetooth 5.2 + 3.5mm" },
      { label: "Weight", value: "245 grams" },
    ],
  },
  {
    id: 7,
    slug: "hd-webcam-with-microphone",
    name: "HD Webcam With Microphone",
    category: "Office",
    image: product7,
    originalPrice: 26.62,
    salePrice: 18.92,
    stock: 19,
    rating: 4.3,
    shortDescription: "USB webcam for meetings and streaming with built-in stereo microphones.",
    description: "An easy plug-and-play webcam that improves video calls with sharper detail and balanced exposure. The integrated microphones capture speech clearly, making it a simple upgrade for remote workstations and study setups.",
    specifications: [
      { label: "Resolution", value: "1080p Full HD" },
      { label: "Audio", value: "Dual stereo microphones" },
      { label: "Mount", value: "Clip and tripod-ready" },
      { label: "Compatibility", value: "Windows, macOS, Linux" },
    ],
  },
  {
    id: 8,
    slug: "ultra-slim-tablet-10-inch",
    name: "Ultra Slim Tablet 10 inch",
    category: "Tablets",
    image: product8,
    originalPrice: 126.38,
    salePrice: 99.93,
    rating: 4.9,
    shortDescription: "A slim entertainment tablet with vivid display and dependable battery life.",
    description: "This 10-inch tablet balances portability and everyday performance for streaming, browsing, reading, and video calls. The slim body travels easily while the crisp display and stereo speakers make media consumption more enjoyable.",
    specifications: [
      { label: "Display", value: "10.1 inch IPS" },
      { label: "Storage", value: "128GB" },
      { label: "Battery", value: "Up to 12 hours" },
      { label: "Connectivity", value: "Wi-Fi 6 and Bluetooth 5.2" },
    ],
  },
];

export const getProductById = (id: number) => products.find(product => product.id === id);

export const getProductBySlug = (slug: string) => products.find(product => product.slug === slug);