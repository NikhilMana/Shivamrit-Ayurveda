"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  ShoppingBag, 
  Star, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { products, Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";

const CATEGORIES = ["All", "Hair Care", "Skin Care", "Accessories", "Sanctuary Kit"];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "name">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { addItem } = useCartStore();

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A2B28] pt-28 sm:pt-36 pb-24 px-4 md:px-12 w-full overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        
        {/* Amazon-Style Header */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#3A2B28]/10 pb-6 sm:pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-[#C89B3C] font-semibold mb-2 block">
              100% Pure Authentic Formulations
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light uppercase tracking-wide text-[#3A2B28]">
              Our Products
            </h1>
            <p className="text-xs sm:text-sm text-[#6D5A56] font-light mt-1 max-w-xl">
              Explore our complete catalogue of handcrafted Ayurvedic elixirs, oils, and body wellness rituals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <div className="relative rounded-full shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, ingredients..."
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full border border-[#C89B3C]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C] placeholder-gray-400 shadow-xs"
              />
              <Search className="w-4 h-4 text-[#C89B3C] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Filter & View Bar (Amazon Controls) */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#C89B3C]/20 shadow-xs w-full overflow-hidden">
          
          {/* Category Tabs (Horizontal Scrollable inside container) */}
          <div className="w-full sm:w-auto min-w-0 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-[#3A2B28] text-white shadow-sm"
                      : "bg-[#FFF8F4] text-[#6D5A56] hover:bg-[#F7EEE7] border border-[#C89B3C]/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort & Layout Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <span className="text-xs text-[#6D5A56] font-mono shrink-0">
              {filteredProducts.length} items
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FFF8F4] border border-[#C89B3C]/30 rounded-xl px-2.5 py-1.5 text-xs text-[#3A2B28] font-medium focus:outline-none max-w-[130px] sm:max-w-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Grid vs List View Switcher */}
            <div className="flex items-center gap-1 bg-[#FFF8F4] border border-[#C89B3C]/20 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#3A2B28] text-white" : "text-[#6D5A56] hover:text-[#3A2B28]"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[#3A2B28] text-white" : "text-[#6D5A56] hover:text-[#3A2B28]"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Empty Search Results */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#C89B3C]/20 p-8 my-8">
            <Sparkles className="w-12 h-12 text-[#C89B3C] mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-[#3A2B28] font-medium">No Products Found</h3>
            <p className="text-sm text-[#6D5A56] mt-1 max-w-md mx-auto">
              We couldn't find any products matching "{searchQuery}". Try clearing filters or searching for something else.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-6 py-2.5 bg-[#3A2B28] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#C89B3C] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Products Catalogue */}
        {viewMode === "grid" ? (
          /* Amazon Modern Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const estimatedMrp = Math.round(product.price * 1.3);
              const discountPercent = Math.round(((estimatedMrp - product.price) / estimatedMrp) * 100);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-[#C89B3C]/25 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image & Badge */}
                  <div className="relative aspect-[4/3] bg-gradient-to-b from-[#FFF8F4] to-[#F7EEE7]/70 p-4 flex items-center justify-center border-b border-[#C89B3C]/10 overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#3A2B28] text-white px-2.5 py-1 rounded-full shadow-xs">
                        {product.category}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-xs w-fit">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {product.size && (
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-medium text-[#6D5A56] bg-white/90 border border-[#C89B3C]/20 px-2 py-0.5 rounded-md">
                        {product.size}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-[#C89B3C]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#C89B3C]" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-[#3A2B28] ml-1">4.9</span>
                        <span className="text-[11px] text-[#6D5A56]">(85+ reviews)</span>
                      </div>

                      {/* Product Title */}
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-serif text-lg font-medium text-[#3A2B28] group-hover:text-[#C89B3C] transition-colors leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="text-xs text-[#6D5A56] font-light line-clamp-2 mt-1.5 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      {/* Ayurvedic Benefits Bullets */}
                      <div className="mt-3 space-y-1">
                        {product.benefits.slice(0, 2).map((benefit, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#3A2B28]">
                            <Check className="w-3 h-3 text-[#3E5C38] shrink-0" />
                            <span className="line-clamp-1">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Delivery Status */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-serif text-2xl font-bold text-[#3A2B28]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{estimatedMrp.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          Save ₹{estimatedMrp - product.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mb-4">
                        <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>FREE Delivery in 5-7 Days</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#C89B3C] hover:bg-[#3A2B28] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-white" />
                          <span>Add to Cart</span>
                        </button>
                        <Link
                          href={`/products/${product.slug}`}
                          className="p-2.5 rounded-full border border-[#C89B3C]/40 bg-[#FFF8F4] text-[#3A2B28] hover:bg-[#F7EEE7] transition-colors"
                          title="View Details"
                        >
                          <ArrowRight className="w-4 h-4 text-[#3A2B28]" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Amazon Horizontal Row List View */
          <div className="flex flex-col gap-6">
            {filteredProducts.map((product) => {
              const estimatedMrp = Math.round(product.price * 1.3);
              const discountPercent = Math.round(((estimatedMrp - product.price) / estimatedMrp) * 100);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-[#C89B3C]/25 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-center overflow-hidden"
                >
                  {/* Left Product Image */}
                  <div className="relative w-full md:w-64 h-56 rounded-2xl bg-gradient-to-b from-[#FFF8F4] to-[#F7EEE7]/70 p-4 border border-[#C89B3C]/20 flex items-center justify-center shrink-0">
                    <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#3A2B28] text-white px-2.5 py-1 rounded-full shadow-xs">
                      {product.category}
                    </span>
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 space-y-2 w-full min-w-0">
                    {/* Ratings */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[#C89B3C]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C89B3C]" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#3A2B28]">4.9</span>
                      <span className="text-xs text-[#6D5A56]">(85+ customer reviews)</span>
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#3A2B28] group-hover:text-[#C89B3C] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#6D5A56] font-light leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Key Benefits Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                      {product.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-[#3A2B28]">
                          <Check className="w-3.5 h-3.5 text-[#3E5C38] shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Commercial Actions */}
                  <div className="w-full md:w-64 p-4 rounded-2xl bg-[#FFF8F4] border border-[#C89B3C]/20 shrink-0 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        Save {discountPercent}% Today
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-serif text-3xl font-bold text-[#3A2B28]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{estimatedMrp.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        MRP incl. of all taxes
                      </span>

                      <div className="mt-3 space-y-1 text-[11px] text-emerald-700 font-medium">
                        <div className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>FREE Delivery (5-7 Days)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
                          <span>In Stock • Direct from Sanctuary</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#C89B3C]/10">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#C89B3C] hover:bg-[#3A2B28] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>Add to Cart</span>
                      </button>

                      <Link
                        href={`/products/${product.slug}`}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-[#C89B3C]/40 bg-white text-[#3A2B28] hover:bg-[#F7EEE7] text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <span>View Full Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3A2B28]" />
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Amazon-Style Customer Guarantees Footer Bar */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl bg-white border border-[#C89B3C]/20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFF8F4] text-[#C89B3C] border border-[#C89B3C]/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#3A2B28]">100% Authentic</h4>
              <p className="text-xs text-[#6D5A56]">Pure traditional formulations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFF8F4] text-[#C89B3C] border border-[#C89B3C]/20 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#3A2B28]">Free Express Delivery</h4>
              <p className="text-xs text-[#6D5A56]">On all prepaid orders nationwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFF8F4] text-[#C89B3C] border border-[#C89B3C]/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#3A2B28]">Cruelty & Chemical Free</h4>
              <p className="text-xs text-[#6D5A56]">No parabens, sulphates or toxins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFF8F4] text-[#C89B3C] border border-[#C89B3C]/20 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#3A2B28]">Cash on Delivery</h4>
              <p className="text-xs text-[#6D5A56]">Pay conveniently at your door</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
