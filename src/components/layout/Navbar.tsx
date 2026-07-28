"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X, ArrowRight, AtSign, Phone, User, Grid } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

const emptySubscribe = () => () => {};

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toggleCart, getTotals } = useCartStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { totalItems } = getTotals();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const threshold = typeof window !== "undefined" ? window.innerHeight * 0.95 : 800;
    if (latest > threshold) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleOpenCartFromMenu = () => {
    setIsMenuOpen(false);
    toggleCart();
  };

  return (
    <>
      {/* Floating Glassmorphism Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex py-1.5 sm:py-2.5 px-4 sm:px-8 md:px-12 items-center justify-between transition-all duration-500 ${
          isScrolled
            ? "bg-[#FFF8F4]/90 backdrop-blur-xl border-b border-[#C89B3C]/20 shadow-[0_10px_30px_rgba(58,43,40,0.06)]"
            : "bg-transparent"
        }`}
      >
        {/* Left Side: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/assets/logo.png"
            alt="Shivamrit Ayurveda Logo"
            width={200}
            height={70}
            priority
            className="h-12 sm:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Right Side: Products, Search, Cart, Account & Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Products Catalogue Icon Link */}
          <Link
            href="/products"
            className="p-2 sm:p-2.5 rounded-full text-[#3A2B28] hover:text-[#C89B3C] hover:bg-[#F7EEE7] transition-all interactive shadow-xs flex items-center gap-1.5"
            aria-label="Our Products Catalogue"
            title="Our Products Catalogue"
          >
            <Grid className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#C89B3C]" strokeWidth={2} />
            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-[#3A2B28] hover:text-[#C89B3C]">
              Products
            </span>
          </Link>
          
          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 sm:p-2.5 rounded-full text-[#3A2B28] hover:text-[#C89B3C] hover:bg-[#F7EEE7] transition-all interactive shadow-xs"
            aria-label="Search Products"
          >
            <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </button>

          {/* Cart Icon with Accent Badge */}
          <button 
            onClick={toggleCart}
            className="relative p-2 sm:p-2.5 rounded-full text-[#3A2B28] hover:text-[#C89B3C] hover:bg-[#F7EEE7] transition-all interactive shadow-xs"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.75} />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD8D8] text-[9px] font-bold text-[#3A2B28] border border-[#FCBABA] shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {/* Account Icon */}
          <Link
            href="/account"
            className="p-2 sm:p-2.5 rounded-full text-[#3A2B28] hover:text-[#C89B3C] hover:bg-[#F7EEE7] transition-all interactive shadow-xs"
            aria-label="My Account"
          >
            <User className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FFD8D8]/60 border border-[#FCBABA] text-[#3A2B28] hover:bg-[#C89B3C] hover:text-white transition-all text-xs font-bold uppercase tracking-widest interactive shadow-xs"
          >
            <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>

        </div>
      </header>

      {/* Quick Search Overlay Input */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-[60] bg-[#FFF8F4]/98 backdrop-blur-xl border-b border-[#C89B3C]/30 p-4 shadow-xl flex justify-center"
          >
            <div className="relative w-full max-w-xl flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Kesh Amrit, Twak Serum, Greeshm Soap..."
                className="w-full bg-[#F7EEE7] border border-[#C89B3C]/30 rounded-full px-5 py-3 text-sm text-[#3A2B28] placeholder:text-[#6D5A56] focus:outline-none focus:border-[#C89B3C] transition-colors"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 p-1 rounded-full text-[#6D5A56] hover:text-[#C89B3C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streamlined Clean Navigation Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FFF8F4]/98 backdrop-blur-3xl text-[#3A2B28] flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-y-auto"
          >
            {/* Top Bar inside Menu Drawer */}
            <div className="flex items-center justify-between border-b border-[#3A2B28]/10 pb-6">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                <Image
                  src="/assets/logo.png"
                  alt="Shivamrit Logo"
                  width={200}
                  height={70}
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </Link>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C89B3C]/40 text-[#3A2B28] hover:bg-[#C89B3C] hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Essential Links Directory */}
            <div className="max-w-2xl mx-auto w-full my-8 flex flex-col gap-4">
              <span className="text-xs uppercase tracking-[0.35em] text-[#C89B3C] font-semibold block mb-2 text-center">
                Shivamrit Direct Navigation
              </span>
              
              {/* Homepage Link */}
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center justify-between p-5 rounded-2xl border border-[#C89B3C]/20 bg-[#F7EEE7] hover:border-[#C89B3C] hover:bg-[#FFD8D8]/40 transition-all shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#C89B3C] font-bold">01</span>
                  <div>
                    <h4 className="font-serif text-2xl text-[#3A2B28] group-hover:text-[#C89B3C] transition-colors">
                      Homepage
                    </h4>
                    <span className="text-xs text-[#6D5A56] font-light block">
                      Sanctuary Hero & Brand Experience
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#6D5A56] group-hover:text-[#C89B3C] group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Our Products Link */}
              <Link
                href="/products"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center justify-between p-5 rounded-2xl border border-[#C89B3C]/20 bg-[#F7EEE7] hover:border-[#C89B3C] hover:bg-[#FFD8D8]/40 transition-all shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#C89B3C] font-bold">02</span>
                  <div>
                    <h4 className="font-serif text-2xl text-[#3A2B28] group-hover:text-[#C89B3C] transition-colors">
                      Our Products
                    </h4>
                    <span className="text-xs text-[#6D5A56] font-light block">
                      Explore Full Ayurvedic Catalogue
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#6D5A56] group-hover:text-[#C89B3C] group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Products Showcase Deck Link */}
              <Link
                href="/#products-section"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center justify-between p-5 rounded-2xl border border-[#C89B3C]/20 bg-[#F7EEE7] hover:border-[#C89B3C] hover:bg-[#FFD8D8]/40 transition-all shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#C89B3C] font-bold">03</span>
                  <div>
                    <h4 className="font-serif text-2xl text-[#3A2B28] group-hover:text-[#C89B3C] transition-colors">
                      Products Showcase
                    </h4>
                    <span className="text-xs text-[#6D5A56] font-light block">
                      3D Interactive Formulations Deck
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#6D5A56] group-hover:text-[#C89B3C] group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Cart Drawer Action Link */}
              <button
                onClick={handleOpenCartFromMenu}
                className="group flex items-center justify-between p-5 rounded-2xl border border-[#C89B3C]/40 bg-[#FFF8F4] hover:bg-[#C89B3C] hover:text-white transition-all text-left shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#C89B3C] font-bold group-hover:text-white">04</span>
                  <div>
                    <h4 className="font-serif text-2xl text-[#3A2B28] group-hover:text-white transition-colors">
                      Shopping Cart
                    </h4>
                    <span className="text-xs text-[#6D5A56] group-hover:text-white/80 font-light block">
                      View items & Checkout
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFD8D8] text-[#3A2B28] border border-[#FCBABA]">
                    {totalItems} items
                  </span>
                  <ShoppingBag className="w-5 h-5 text-[#C89B3C] group-hover:text-white" />
                </div>
              </button>
            </div>

            {/* Bottom Support Info inside Menu Drawer */}
            <div className="border-t border-[#3A2B28]/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6D5A56] uppercase tracking-widest gap-2">
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/shivamrit_ayurveda_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#C89B3C] transition-colors"
                >
                  <AtSign className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>@shivamrit_ayurveda_</span>
                </a>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>+91 8123403829</span>
                </span>
              </div>
              <span>Shivamrit Ayurveda © 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
