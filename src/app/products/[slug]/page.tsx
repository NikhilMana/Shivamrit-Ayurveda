"use client";

import { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import gsap from "gsap";
import { products as localProducts } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { Check, ShoppingBag, ShieldCheck, Star, ZoomIn, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  } | null;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addItem } = useCartStore();
  const imageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Reviews state
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const supabase = createClient();

  // Fetch product from Supabase DB, fallback to local data
  const { data: dbProduct } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("slug", slug)
        .single();
      return data as any;
    },
  });

  const localProduct = localProducts.find((p) => p.slug === slug);
  const product = dbProduct
    ? {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        category: dbProduct.category_id || "Ayurvedic Care",
        shortDescription: dbProduct.description,
        price: Number(dbProduct.price),
        offerPrice: dbProduct.offer_price ? Number(dbProduct.offer_price) : undefined,
        images:
          dbProduct.product_images && dbProduct.product_images.length > 0
            ? dbProduct.product_images
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((img: any) => img.image_url)
            : localProduct?.images || ["/assets/combo pack.png"],
        benefits: dbProduct.benefits || localProduct?.benefits || [],
        ingredients: dbProduct.ingredients || "100% Active Botanical Herbs",
        usage: dbProduct.usage_instructions || "Use as directed on package.",
      }
    : localProduct
    ? {
        ...localProduct,
        ingredients: "Active Herbal Formulations",
        usage: "Gentle daily application.",
      }
    : null;

  // Fetch Reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data } = await supabase
        .from("reviews")
        .select("*, profile:profiles(full_name)")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (!product) return;
    const tl = gsap.timeline();
    tl.fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    ).fromTo(
      infoRef.current?.children ? Array.from(infoRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" },
      "-=0.5"
    );
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center pt-32">
        <p className="text-gray-500 font-serif text-xl">Loading product details...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in to submit a review.");
      setReviewSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: user.id,
      rating: newRating,
      review: newReviewText,
    } as any);

    if (error) {
      alert(error.message);
    } else {
      setNewReviewText("");
      refetchReviews();
    }
    setReviewSubmitting(false);
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img: string) =>
      img.startsWith("http") ? img : `https://www.shivamritayurveda.in${img}`
    ),
    "description": product.shortDescription,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Shivamrit Ayurveda"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.shivamritayurveda.in/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.offerPrice || product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Shivamrit Ayurveda"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": Math.max(1, reviews.length)
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#3A2B28] pt-32 pb-24 px-8 md:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 mb-16">
          {/* Gallery Left */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-32 flex gap-6">
              {/* Thumbnails */}
              <div className="flex flex-col gap-4 w-20">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-[#F7EEE7] ${
                      activeImage === idx
                        ? "border-[#C89B3C] shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image with Zoom */}
              <div
                ref={imageRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                className="flex-1 aspect-[4/5] rounded-[36px] overflow-hidden bg-[#F7EEE7] border border-[#C89B3C]/25 relative p-6 shadow-sm cursor-zoom-in"
              >
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  priority
                  className={`object-contain p-4 transition-transform duration-200 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm text-[#3A2B28] opacity-70">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Info Right */}
          <div
            ref={infoRef}
            className="w-full lg:w-1/2 flex flex-col justify-center py-6 lg:py-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#3A2B28] bg-[#FFD8D8]/70 border border-[#FCBABA] px-3.5 py-1 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-[#C89B3C]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">{avgRating} ({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-[#3A2B28] mb-4 font-normal">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <p className="font-serif text-3xl font-bold text-[#C89B3C]">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="text-[#6D5A56] font-light leading-relaxed mb-8 text-base md:text-lg">
              {product.shortDescription}
            </p>

            <div className="mb-8 p-6 rounded-2xl bg-[#F7EEE7] border border-[#C89B3C]/20">
              <h3 className="uppercase tracking-widest text-xs font-bold mb-4 text-[#C89B3C]">
                Key Ayurvedic Benefits
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center text-[#3A2B28] text-sm">
                    <Check className="w-4 h-4 text-[#3E5C38] mr-2.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-[#C89B3C] text-white uppercase tracking-widest text-xs font-bold hover:bg-[#3A2B28] transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Add to Cart</span>
              </button>
            </div>

            <p className="text-xs text-center text-[#6D5A56] flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#3E5C38]" /> 100% Authentic Formulations • Standard Delivery ₹49 (5-7 Days)
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-12 border-t border-[#C89B3C]/20">
          <h2 className="font-serif text-3xl text-[#3A2B28] mb-8 font-bold">
            Customer Reviews ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-white border border-[#C89B3C]/15 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#3A2B28]">
                        {rev.profile?.full_name || "Verified Purchaser"}
                      </span>
                      <div className="flex items-center text-[#C89B3C]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#6D5A56]">{rev.review}</p>
                    <span className="text-xs text-gray-400 block pt-1">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="p-6 rounded-2xl bg-[#F7EEE7] border border-[#C89B3C]/20 h-fit">
              <h3 className="font-serif text-xl font-bold text-[#3A2B28] mb-4">
                Write a Review
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Rating
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white text-sm"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your experience with this Ayurvedic preparation..."
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a392a] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#234b37] disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reviewSubmitting ? "Submitting..." : "Submit Review"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
