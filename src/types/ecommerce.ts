import { Database } from "./database";

export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DbAddress = Database["public"]["Tables"]["addresses"]["Row"];
export type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
export type DbProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type DbOrder = Database["public"]["Tables"]["orders"]["Row"];
export type DbOrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type DbReview = Database["public"]["Tables"]["reviews"]["Row"];
export type DbSettings = Database["public"]["Tables"]["settings"]["Row"];

export interface ProductWithDetails extends DbProduct {
  category?: DbCategory | null;
  product_images?: DbProductImage[];
  images: string[];
}

export interface CartItemWithProduct {
  id: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  product: ProductWithDetails;
}

export interface OrderWithDetails extends DbOrder {
  address?: DbAddress | null;
  order_items: (DbOrderItem & {
    product?: ProductWithDetails | null;
  })[];
  profile?: DbProfile | null;
}

export interface ReviewWithProfile extends DbReview {
  profile?: DbProfile | null;
}
