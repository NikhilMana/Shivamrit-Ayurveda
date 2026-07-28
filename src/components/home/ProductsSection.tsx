"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from "framer-motion";
import { ShoppingBag, ChevronDown, X, Sparkles, Check, ShieldCheck } from "lucide-react";
import { products, Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";

interface CardProps {
  product: Product;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onOpenDetails: (product: Product) => void;
}

function StickyProductCard({ product, index, total, progress, onOpenDetails }: CardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  // Calculate normalized interval for this card in the overall scroll progress
  const cardStart = index / total;
  const cardEnd = 1;
  const targetScale = 1 - (total - 1 - index) * 0.04;

  const scale = useTransform(progress, [cardStart, cardEnd], [1, targetScale]);
  const opacity = useTransform(progress, [cardStart, cardStart + 0.15], [0.85, 1]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  const isEven = index % 2 === 0;

  return (
    <div
      ref={containerRef}
      className="sticky top-[58px] sm:top-[70px] md:top-[80px] flex items-start justify-center pt-1 pb-4"
    >
      <motion.div
        style={{
          scale,
          opacity,
          top: `calc(58px + ${index * 6}px)`,
          willChange: "transform, opacity",
        }}
        className={`relative w-full max-w-4xl min-h-[58vh] sm:min-h-[66vh] max-h-[72vh] rounded-[24px] sm:rounded-[36px] border border-[#C89B3C]/30 ${
          isEven ? "bg-white" : "bg-[#FFF8F4]"
        } p-3.5 sm:p-6 shadow-[0_15px_45px_rgba(58,43,40,0.07)] overflow-hidden group flex flex-col justify-between transition-all duration-300`}
      >
        {/* Soft Accent Background Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFD8D8]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-[#3A2B28]/10 pb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-[#3A2B28] bg-[#FFD8D8]/70 border border-[#FCBABA] px-2.5 py-0.5 rounded-full shadow-xs">
              {product.category}
            </span>
            {product.size && (
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6D5A56] font-mono">
                {product.size}
              </span>
            )}
          </div>
          <span className="font-serif text-lg sm:text-2xl font-bold text-[#C89B3C]">
            {(index + 1).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Hero Product Image Container (Eagerly preloaded, crisp render) */}
        <div className="relative flex-1 w-full my-1.5 rounded-[18px] sm:rounded-[24px] overflow-hidden bg-gradient-to-b from-[#FFF8F4] to-[#F7EEE7]/70 border border-[#C89B3C]/20 flex items-center justify-center group/img shadow-inner min-h-[190px] sm:min-h-[260px]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={true}
            sizes="(max-width: 768px) 90vw, 60vw"
            className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover/img:scale-105"
          />
        </div>

        {/* Key Benefits Row */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 my-1 relative z-10">
          {product.benefits.slice(0, 3).map((benefit, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-medium bg-[#FFF8F4] border border-[#C89B3C]/25 text-[#3A2B28] shadow-xs"
            >
              <Check className="w-3 h-3 text-[#3E5C38]" />
              {benefit}
            </span>
          ))}
        </div>

        {/* Bottom Info & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#3A2B28]/10 relative z-10">
          
          {/* Product Name & Price */}
          <div>
            <h3 className="font-serif text-sm sm:text-xl text-[#3A2B28] font-medium tracking-wide">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-serif text-base sm:text-xl font-bold text-[#C89B3C]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6D5A56] border border-[#6D5A56]/20 px-1.5 py-0.5 rounded-md bg-[#FFF8F4]">
                MRP (Incl. taxes)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#C89B3C] hover:bg-[#3A2B28] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg interactive hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Add to Cart</span>
            </button>

            {/* More Info Button */}
            <button
              onClick={() => onOpenDetails(product)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-[#C89B3C]/40 bg-[#FFF8F4] text-[#3A2B28] hover:border-[#C89B3C] hover:bg-[#FFD8D8]/30 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors interactive shadow-xs"
            >
              <span>More Info</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#C89B3C] animate-bounce" />
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}

interface ModalProps {
  product: Product | null;
  onClose: () => void;
}

function ProductDetailsModal({ product, onClose }: ModalProps) {
  const { addItem } = useCartStore();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 pt-20 sm:pt-24 pb-6 bg-[#3A2B28]/60 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[82vh] overflow-y-auto rounded-[28px] sm:rounded-[36px] border border-[#C89B3C]/30 bg-[#FFF8F4] p-5 sm:p-8 text-[#3A2B28] shadow-2xl my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-[#F7EEE7] hover:bg-[#FFD8D8] text-[#3A2B28] transition-colors z-20 shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-[#3A2B28] bg-[#FFD8D8]/70 border border-[#FCBABA] px-3 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.size && (
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6D5A56] font-mono">
                {product.size}
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#3A2B28] font-medium leading-snug">
            {product.name}
          </h2>
          <span className="font-serif text-xl sm:text-2xl font-bold text-[#C89B3C] mt-1 block">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Product Image Preview */}
        <div className="relative h-48 sm:h-60 w-full rounded-[20px] overflow-hidden border border-[#C89B3C]/20 bg-[#F7EEE7] mb-5">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={true}
            className="object-contain p-3"
          />
        </div>

        {/* Formulation Description */}
        <div className="mb-5">
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C89B3C] mb-1.5">
            Formulation Overview
          </h4>
          <p className="text-[#6D5A56] text-xs sm:text-sm leading-relaxed font-light">
            {product.shortDescription}
          </p>
        </div>

        {/* Benefits Badges */}
        <div className="mb-6">
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C89B3C] mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" /> Key Ayurvedic Benefits
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {product.benefits.map((benefit, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F7EEE7] border border-[#C89B3C]/30 text-[#3A2B28]"
              >
                <Check className="w-3 h-3 text-[#3E5C38]" />
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Commercial Trust & Add to Cart */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#3A2B28]/10">
          <span className="text-[11px] text-[#6D5A56] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#3E5C38]" /> 100% Authentic Ayurvedic Formulation
          </span>
          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#C89B3C] text-white hover:bg-[#3A2B28] text-xs font-bold uppercase tracking-widest transition-all shadow-lg interactive hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>Add to Cart — ₹{product.price.toLocaleString("en-IN")}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={targetRef}
      id="products-section"
      className="relative bg-transparent text-[#3A2B28] px-3 sm:px-8 md:px-12 pt-2 sm:pt-4 pb-12 z-20"
    >
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-3 sm:mb-4 flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.35em] text-[#C89B3C] font-semibold mb-1">
          Handcrafted Ayurvedic Rituals
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light uppercase tracking-wide text-[#3A2B28]">
          Sacred Formulations
        </h2>
        <div className="mt-2 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />
      </div>

      {/* Fluid 3D Sticky Card Stack */}
      <div className="relative max-w-4xl mx-auto flex flex-col space-y-4">
        {products.map((product, i) => (
          <StickyProductCard
            key={product.id}
            product={product}
            index={i}
            total={products.length}
            progress={scrollYProgress}
            onOpenDetails={setSelectedProduct}
          />
        ))}
      </div>

      {/* More Info Pop-up Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
