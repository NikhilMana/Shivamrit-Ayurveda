-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table creations with IF NOT EXISTS

-- ========================================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automated trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Customer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- 2. ADDRESSES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 3. CATEGORIES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. PRODUCTS TABLE
-- ========================================================
CREATE TABLE public.products (
  id VARCHAR(255) PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  offer_price NUMERIC(10, 2) CHECK (offer_price >= 0),
  stock INT NOT NULL DEFAULT 50 CHECK (stock >= 0),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  size VARCHAR(100),
  benefits TEXT[] DEFAULT '{}',
  usage_instructions TEXT,
  ingredients TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 5. PRODUCT IMAGES TABLE
-- ========================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
);

-- ========================================================
-- 6. CART ITEMS TABLE
-- ========================================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- ========================================================
-- 7. ORDERS TABLE
-- ========================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'cod')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 8. ORDER ITEMS TABLE
-- ========================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL
);

-- ========================================================
-- 9. PAYMENTS TABLE
-- ========================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- 10. REVIEWS TABLE
-- ========================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 11. SETTINGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Shivamrit Ayurveda',
  support_email TEXT NOT NULL DEFAULT 'support@shivamritayurveda.com',
  support_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  address TEXT NOT NULL DEFAULT 'Haridwar, Uttarakhand, India',
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by owner or admin" ON public.profiles;
CREATE POLICY "Public profiles are viewable by owner or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ADDRESSES
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage product images" ON public.product_images;
CREATE POLICY "Admin manage product images" ON public.product_images
  FOR ALL USING (public.is_admin());

-- CART ITEMS
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_admin()))
  );
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

-- PAYMENTS
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (user_id = auth.uid() OR public.is_admin()))
  );

-- REVIEWS
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- SETTINGS
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
CREATE POLICY "Admin manage settings" ON public.settings
  FOR ALL USING (public.is_admin());

-- Storage Buckets Creation (for Supabase storage)
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO NOTHING;
