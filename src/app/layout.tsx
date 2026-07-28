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
    "anti dandruff shampoo",
    "antidandruff shampoo",
    "best anti dandruff shampoo",
    "ayurvedic anti dandruff shampoo",
    "herbal anti dandruff shampoo",
    "natural anti dandruff shampoo",
    "shampoo for itchy scalp and dandruff",
    "anti dandruff hair oil",
    "antidandruff hair oil",
    "hair oil for dandruff",
    "dandruff control oil",
    "ayurvedic hair oil for dandruff",
    "hair growth hair oil",
    "best hair growth oil",
    "ayurvedic hair growth oil",
    "herbal hair growth oil",
    "hair regrowth oil",
    "hair fall control oil",
    "hair oil for fast hair growth",
    "bhringraj hair oil for hair growth",
    "scalp treatment for dandruff",
    "dry scalp dandruff treatment",
    "natural scalp care",
    "kumkumadi serum for glowing skin",
    "face serum for skin brightening",
    "organic neem wood comb",
    "wooden comb for hair growth and scalp massage",
    "Organic Ayurvedic Cosmetics",
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/assets/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TWQNLL5Z');`,
          }}
        />
        {/* End Google Tag Manager */}
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TWQNLL5Z"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
