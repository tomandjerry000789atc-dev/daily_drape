export type UserRole = "customer" | "admin" | "delivery";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  sku: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string; // category slug
  subcategory?: string;
  description: string;
  material_care: string;
  price: number;
  mrp: number;
  discount_percent: number;
  images: string[];
  variants: ProductVariant[];
  rating: number;
  rating_count: number;
  tags: string[]; // e.g. trending, new, bestseller, sale
  created_at: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Omit<Address, "id" | "user_id" | "is_default">;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  paymentMethod: "cod" | "demo_card" | "demo_upi";
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
  trackingNumber?: string;
  assignedDeliveryId?: string | null;
  createdAt: string;
  statusHistory: { status: OrderStatus; at: string }[];
}
