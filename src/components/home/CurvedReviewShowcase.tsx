"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    id: "01",
    image: "/assets/reviews/review_01.jpg",
    product: "Kesh Kalpa Shampoo",
  },
  {
    id: "02",
    image: "/assets/reviews/review_02.jpg",
    product: "Kesh Amrit Hair Oil",
  },
  {
    id: "03",
    image: "/assets/reviews/review_03.jpg",
    product: "Authentic Formulation",
  },
  {
    id: "04",
    image: "/assets/reviews/review_04.jpg",
    product: "Twak Amrit Face Oil",
  },
  {
    id: "05",
    image: "/assets/reviews/review_05.jpg",
    product: "Combo Pack Ritual",
  },
  {
    id: "06",
    image: "/assets/reviews/review_06.jpg",
    product: "Natural Neem Comb",
  },
  {
    id: "07",
    image: "/assets/reviews/review_07.jpg",
    product: "Greeshm Soap",
  },
  {
    id: "08",
    image: "/assets/reviews/review_08.jpg",
    product: "Sanctuary Care",
  },
];

export default function CurvedReviewShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(2);
  
  // Drag & Touch Swipe State
  const [isInteracting, setIsInteracting] = useState(false);
  const [startPos, setStartPos] = useState(0);

  const totalCards = REVIEWS.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsInteracting(true);
    setStartPos(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isInteracting) return;
    const diff = e.clientX - startPos;
    if (diff > 40) {
      handlePrev();
      setIsInteracting(false);
    } else if (diff < -40) {
      handleNext();
      setIsInteracting(false);
    }
  };

  const handleMouseUp = () => {
    setIsInteracting(false);
  };

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    setStartPos(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isInteracting) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startPos;

    if (diff > 35) {
      handlePrev();
      setIsInteracting(false);
    } else if (diff < -35) {
      handleNext();
      setIsInteracting(false);
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
  };

  return (
    <section
      ref={containerRef}
      className="relative bg-[#FFF8F4] text-[#3A2B28] py-16 sm:py-24 px-4 sm:px-8 overflow-hidden select-none"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FFD8D8]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14 relative z-10 flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.35em] text-[#C89B3C] font-semibold mb-2">
          Sanctuary Testimonials
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-wide text-[#3A2B28]">
          Loved By Our Seekers
        </h2>
        <p className="mt-2.5 text-xs sm:text-base text-[#6D5A56] font-light max-w-xl px-2">
          Real stories & direct feedback from verified customers. Swipe horizontally to view review snapshots.
        </p>
        <div className="mt-3.5 h-[1px] w-28 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />
      </div>

      {/* Curved 3D Arc Perspective Gallery with Mouse Drag & Mobile Touch Swipe */}
      <div
        className="relative w-full max-w-7xl mx-auto h-[440px] sm:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="relative w-full h-full flex items-center justify-center transition-all duration-700 ease-out"
        >
          {REVIEWS.map((review, i) => {
            const offset = i - activeIndex;
            const absOffset = Math.abs(offset);

            // Compute 3D Arc transform attributes
            const rotateY = offset * -14;
            const translateX = offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 170 : 220);
            const translateZ = -absOffset * 100;
            const translateY = Math.pow(absOffset, 1.8) * 10;
            const scale = Math.max(0.75, 1 - absOffset * 0.11);
            const opacity = Math.max(0.2, 1 - absOffset * 0.28);
            const isCenter = offset === 0;

            return (
              <motion.div
                key={review.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  position: "absolute",
                  transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex: 50 - absOffset,
                }}
                className={`w-[220px] sm:w-[270px] h-[390px] sm:h-[460px] rounded-[28px] sm:rounded-[32px] overflow-hidden border transition-all duration-500 shadow-2xl backdrop-blur-md bg-white ${
                  isCenter
                    ? "border-[#C89B3C] shadow-[0_20px_50px_rgba(200,155,60,0.25)] ring-2 ring-[#C89B3C]/40"
                    : "border-[#C89B3C]/20 shadow-[0_10px_30px_rgba(58,43,40,0.08)] hover:border-[#C89B3C]/60"
                }`}
              >
                {/* Clean Snapshot Image Container without bottom text overlay */}
                <div className="relative w-full h-full bg-[#0F0F0F]">
                  <Image
                    src={review.image}
                    alt={review.product}
                    fill
                    priority={true}
                    sizes="(max-width: 768px) 80vw, 30vw"
                    className="object-cover"
                  />

                  {/* Clean Top Header Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-[#3A2B28] bg-[#FFF8F4]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C89B3C]/30 shadow-xs">
                      {review.product}
                    </span>
                    <div className="flex items-center gap-0.5 bg-[#3A2B28]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#C89B3C]/40">
                      <Star className="w-3 h-3 text-[#C89B3C] fill-[#C89B3C]" />
                      <span className="text-[10px] font-bold text-white font-mono">5.0</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation & Progress Bar */}
      <div className="max-w-md mx-auto mt-6 sm:mt-8 flex items-center justify-between px-6 py-3 rounded-full bg-white border border-[#C89B3C]/30 shadow-lg relative z-20">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-[#FFF8F4] hover:bg-[#C89B3C] text-[#3A2B28] hover:text-white transition-all shadow-xs active:scale-95"
          aria-label="Previous Review"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Progress Indicators */}
        <div className="flex items-center gap-2">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === activeIndex
                  ? "w-8 bg-[#C89B3C]"
                  : "w-2 bg-[#C89B3C]/30 hover:bg-[#C89B3C]/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-[#FFF8F4] hover:bg-[#C89B3C] text-[#3A2B28] hover:text-white transition-all shadow-xs active:scale-95"
          aria-label="Next Review"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
