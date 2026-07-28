import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import Cursor from "@/components/ui/Cursor";
import CartDrawer from "@/components/cart/CartDrawer";
import JsonLd from "@/components/seo/JsonLd";

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.shivamritayurveda.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shivamrit Ayurveda | Pure Authentic Botanical Wellness & Hair Care",
    template: "%s | Shivamrit Ayurveda",
  },
  description:
    "Discover authentic 100% natural Ayurvedic hair care oils, anti-dandruff shampoos, Kumkumadi face serums, pure neem combs, and herbal soaps. Handcrafted ancient botanical remedies for hair growth, scalp healing, and glowing skin.",
  keywords: [
    "Shivamrit Ayurveda",
    "Ayurvedic Hair Oil",
    "Kesh Amrit Hair Oil",
    "Kesh Kalpa Anti Dandruff Shampoo",
    "Twak Amrit Face Serum",
    "Kumkumadi Face Oil",
    "Pure Neem Wood Comb",
    "Greeshm Soap",
    "Organic Ayurvedic Cosmetics",
    "Ayurvedic Scalp Treatment",
    "Natural Beauty Products India",
  ],
  authors: [{ name: "Shivamrit Ayurveda" }],
  creator: "Shivamrit Ayurveda",
  publisher: "Shivamrit Ayurveda",
  category: "Health & Beauty",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "Shivamrit Ayurveda | Handcrafted Pure Botanical Formulations",
    description:
      "Transform your hair and skin health with centuries-old Ayurvedic wisdom. 100% authentic, paraben-free, sulphate-free, and cruelty-free.",
    siteName: "Shivamrit Ayurveda",
    images: [
      {
        url: "/assets/combo pack.png",
        width: 1200,
        height: 630,
        alt: "Shivamrit Ayurveda Sacred Botanical Formulations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivamrit Ayurveda | Pure Botanical Wellness",
    description:
      "Handcrafted natural hair oil, anti-dandruff shampoo, kumkumadi face serum, and neem combs.",
    images: ["/assets/combo pack.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      <head>
        <JsonLd />
      </head>
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
