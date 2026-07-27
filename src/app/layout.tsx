import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import Cursor from "@/components/ui/Cursor";
import CartDrawer from "@/components/cart/CartDrawer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shivamrit Ayurveda | Premium Ayurvedic Wellness",
  description: "Experience authentic Ayurvedic wellness crafted from timeless herbal wisdom and designed for modern lifestyles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <QueryProvider>
          <SmoothScrollProvider>
            <Cursor />
            <CartDrawer />
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

