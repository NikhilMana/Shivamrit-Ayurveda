-- Migration: Add cancellation_requested to order_status and refunded to payment_status

-- Update order_status constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'cancellation_requested'));

-- Update payment_status constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add cancel_reason column if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
