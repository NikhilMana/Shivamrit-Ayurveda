export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string;
          price: number;
          offer_price: number | null;
          stock: number;
          featured: boolean;
          status: "active" | "draft" | "archived";
          size: string | null;
          benefits: string[];
          usage_instructions: string | null;
          ingredients: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description: string;
          price: number;
          offer_price?: number | null;
          stock?: number;
          featured?: boolean;
          status?: "active" | "draft" | "archived";
          size?: string | null;
          benefits?: string[];
          usage_instructions?: string | null;
          ingredients?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          offer_price?: number | null;
          stock?: number;
          featured?: boolean;
          status?: "active" | "draft" | "archived";
          size?: string | null;
          benefits?: string[];
          usage_instructions?: string | null;
          ingredients?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          display_order?: number;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          address_id: string | null;
          subtotal: number;
          shipping_charge: number;
          discount: number;
          total_amount: number;
          payment_method: "razorpay" | "cod";
          payment_status: "pending" | "paid" | "failed";
          order_status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address_id?: string | null;
          subtotal: number;
          shipping_charge?: number;
          discount?: number;
          total_amount: number;
          payment_method: "razorpay" | "cod";
          payment_status?: "pending" | "paid" | "failed";
          order_status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address_id?: string | null;
          subtotal?: number;
          shipping_charge?: number;
          discount?: number;
          total_amount?: number;
          payment_method?: "razorpay" | "cod";
          payment_status?: "pending" | "paid" | "failed";
          order_status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          price?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          review: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          review: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          review?: string;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          store_name: string;
          support_email: string;
          support_phone: string;
          address: string;
          logo_url: string | null;
          banner_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_name?: string;
          support_email?: string;
          support_phone?: string;
          address?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_name?: string;
          support_email?: string;
          support_phone?: string;
          address?: string;
          logo_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
