
export enum Category {
  Clothing = 'Clothing',
  Electronics = 'Electronics',
  Home = 'Home',
  Accessories = 'Accessories'
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  rating: number;
  reviews: number; // Count of reviews
  reviewsList?: Review[]; // Array of actual review objects
  features: string[];
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export type Role = 'guest' | 'user' | 'admin';

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Work"
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string; // For mock authentication
  addresses: Address[];
  wishlist: string[]; // Array of Product IDs
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'card' | 'esewa' | 'khalti' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderTimeline {
  placed: string;
  processing?: string;
  shipped?: string;
  delivered?: string;
  cancelled?: string;
  refunded?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  date: string;
  status: OrderStatus;
  timeline: OrderTimeline;
  shippingAddress: string; // Formatted string or could be object
  billingAddress: string;
  paymentMethod: string; // e.g., "Visa ending in 4242"
  paymentMethodType: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'error' | 'email';
  message: string;
  duration?: number;
}
