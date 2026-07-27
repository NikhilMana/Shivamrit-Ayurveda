import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shivamrit-ayurveda.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shivamrit Ayurveda | Premium Ayurvedic Hair & Skin Formulations",
    template: "%s | Shivamrit Ayurveda",
  },
  description:
    "Discover authentic, 100% natural Ayurvedic hair care oils, anti-dandruff shampoos, saffron face serums, and pure neem combs. Handcrafted traditional wellness for modern living.",
  keywords: [
    "Shivamrit Ayurveda",
    "Ayurvedic Hair Oil",
    "Kesh Amrit",
    "Kesh Kalpa Shampoo",
    "Twak Amrit Face Serum",
    "Kumkumadi Oil",
    "Pure Neem Comb",
    "Natural Skin Care",
    "Organic Ayurvedic Products",
  ],
  authors: [{ name: "Shivamrit Ayurveda" }],
  creator: "Shivamrit Ayurveda",
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "Shivamrit Ayurveda | Handcrafted Pure Ayurvedic Formulations",
    description:
      "Transform your hair and skin health with centuries-old Ayurvedic wisdom. 100% authentic, paraben-free, and cruelty-free.",
    siteName: "Shivamrit Ayurveda",
    images: [
      {
        url: "/assets/combo pack.png",
        width: 1200,
        height: 630,
        alt: "Shivamrit Ayurveda Essential Ritual Kit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivamrit Ayurveda | Sacred Ayurvedic Formulations",
    description:
      "Handcrafted natural hair oil, anti-dandruff shampoo, kumkumadi face serum, and neem combs.",
    images: ["/assets/combo pack.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
            <main className="flex-1 flex flex-col">{children}</main>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
