
import { Product, Category, Coupon } from './types';

export const APP_NAME = "Lumina";

export const MOCK_COUPONS: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0 },
  { code: 'SAVE20', type: 'fixed', value: 20, minOrder: 100 },
  { code: 'SUMMER24', type: 'percent', value: 15, minOrder: 50 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: "Minimalist Wool Trench",
    price: 249.99,
    category: Category.Clothing,
    description: "A timeless tailored trench coat crafted from premium merino wool blend. Features a classic double-breasted silhouette.",
    image: "https://picsum.photos/id/1059/800/1000",
    rating: 4.8,
    reviews: 124,
    features: ["100% Merino Wool", "Water Resistant", "Sustainable Lining"],
    stock: 15,
    reviewsList: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Alice M.',
        rating: 5,
        comment: 'Absolutely stunning quality. Fits perfectly and keeps me warm.',
        date: '2023-11-15T10:00:00Z'
      },
      {
        id: 'r2',
        userId: 'u2',
        userName: 'John D.',
        rating: 4,
        comment: 'Great coat, but the sleeves are slightly long for me.',
        date: '2023-12-01T14:30:00Z'
      }
    ]
  },
  {
    id: 'p2',
    name: "SonicPro Noise Cancelling Headphones",
    price: 349.00,
    category: Category.Electronics,
    description: "Immerse yourself in pure sound with industry-leading noise cancellation and 40-hour battery life.",
    image: "https://picsum.photos/id/1/800/800",
    rating: 4.9,
    reviews: 850,
    features: ["Active Noise Cancellation", "40h Battery", "Multipoint Bluetooth"],
    stock: 45,
    reviewsList: [
      {
        id: 'r3',
        userId: 'u3',
        userName: 'TechGuru',
        rating: 5,
        comment: 'Best ANC headphones on the market. Better than the competitors.',
        date: '2024-01-10T09:15:00Z'
      }
    ]
  },
  {
    id: 'p3',
    name: "Ceramic Artisan Vase",
    price: 89.50,
    category: Category.Home,
    description: "Hand-thrown ceramic vase with a matte speckled glaze. Perfect for dried florals or as a standalone statement piece.",
    image: "https://picsum.photos/id/106/800/1000",
    rating: 4.7,
    reviews: 45,
    features: ["Handcrafted", "Dishwasher Safe", "Unique Glaze"],
    stock: 8,
    reviewsList: []
  },
  {
    id: 'p4',
    name: "Urban Explorer Backpack",
    price: 129.99,
    category: Category.Accessories,
    description: "Designed for the modern commuter. Waterproof materials, dedicated laptop compartment, and ergonomic straps.",
    image: "https://picsum.photos/id/103/800/1000",
    rating: 4.6,
    reviews: 210,
    features: ["Waterproof", "16L Capacity", "Anti-theft Pocket"],
    stock: 2,
    reviewsList: []
  },
  {
    id: 'p5',
    name: "Analog Mechanical Keyboard",
    price: 199.00,
    category: Category.Electronics,
    description: "Tactile typing experience with hot-swappable switches and aircraft-grade aluminum chassis.",
    image: "https://picsum.photos/id/366/800/600",
    rating: 4.9,
    reviews: 342,
    features: ["RGB Backlight", "Hot-swappable", "Aluminum Body"],
    stock: 0,
    reviewsList: []
  },
  {
    id: 'p6',
    name: "Linen Lounge Set",
    price: 110.00,
    category: Category.Clothing,
    description: "Breathable linen set including oversized shirt and drawstring shorts. Ultimate comfort for home or vacation.",
    image: "https://picsum.photos/id/1005/800/1000",
    rating: 4.5,
    reviews: 89,
    features: ["100% Organic Linen", "Relaxed Fit", "Machine Washable"],
    stock: 30,
    reviewsList: []
  },
  {
    id: 'p7',
    name: "Smart Coffee Maker",
    price: 299.00,
    category: Category.Home,
    description: "Wifi-enabled precision brewer. Schedule your morning cup from your phone with temperature control.",
    image: "https://picsum.photos/id/425/800/800",
    rating: 4.4,
    reviews: 156,
    features: ["App Control", "Precision Temp", "Built-in Grinder"],
    stock: 12,
    reviewsList: []
  },
  {
    id: 'p8',
    name: "Leather Weekend Bag",
    price: 450.00,
    category: Category.Accessories,
    description: "Full-grain Italian leather duffel bag. Ages beautifully and fits into overhead compartments.",
    image: "https://picsum.photos/id/1012/800/600",
    rating: 4.9,
    reviews: 67,
    features: ["Italian Leather", "Brass Hardware", "5 Year Warranty"],
    stock: 5,
    reviewsList: []
  }
];
