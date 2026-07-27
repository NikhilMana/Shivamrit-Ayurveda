# Shivamrit Ayurveda - Production E-Commerce Platform

A production-ready, highly scalable, and beautifully animated e-commerce application built for Shivamrit Ayurveda.

---

## 🌿 Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router with Server Components & Route Handlers)
- **Database**: Supabase PostgreSQL + Row Level Security (RLS)
- **Authentication**: Supabase Auth (Email & Google OAuth 2.0)
- **State & Data Fetching**: Zustand (Persisted Cart) & TanStack Query
- **Payments**: Razorpay Online Payments & Cash on Delivery (COD)
- **Emails**: Resend Email API
- **Storage**: Supabase Storage Buckets & Cloudinary
- **Styling & Motion**: Tailwind CSS & Framer Motion & GSAP

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase, Razorpay, Resend, and Cloudinary keys in `.env.local`.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Schema Migration & Seeding

Run the database seed script to apply migrations and seed initial categories, products, and store settings into Supabase PostgreSQL:

```bash
node scripts/seed-ecommerce.js
```

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Key Features

### Customer Experience
- 100% Responsive, Animated E-Commerce Interface
- Product Catalog with Image Gallery, Zoom, and Customer Reviews
- 4-Step Simple Checkout (Address → Payment Method → Review → Confirmation)
- Real-time Order Tracking & Customer Account Portal (`/account`)

### Admin Dashboard (`/admin`)
- Analytics & Revenue Overview
- Product Catalog Management (Stock, Prices, Featured Toggle, Delete)
- Order Status Management (Pending → Confirmed → Shipped → Delivered → Cancelled)
- Customer Directory & Store Settings

---

## 🔒 Security & RLS

- Row Level Security enabled across all 11 PostgreSQL tables.
- Customer Isolation policies restrict customers to accessing only their own profile, addresses, cart items, and orders.
- Role-based authorization enforced in `middleware.ts` restricting access to `/admin`.
