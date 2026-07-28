"use client";

import { useSyncExternalStore } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

const emptySubscribe = () => () => {};

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotals } = useCartStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { totalPrice } = getTotals();

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#3A2B28]/40 backdrop-blur-sm z-[130]"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FFF8F4] text-[#3A2B28] shadow-2xl z-[131] flex flex-col border-l border-[#C89B3C]/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#3A2B28]/10 flex items-center justify-between bg-[#F7EEE7]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#C89B3C]" />
                <h2 className="font-serif text-xl font-medium tracking-wide">Your Sanctuary Cart</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#FFD8D8]/50 text-[#3A2B28] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-[#FFD8D8]/50 border border-[#FCBABA] flex items-center justify-center text-[#C89B3C]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-serif text-[#3A2B28]">Your cart is currently empty</p>
                  <p className="text-xs text-[#6D5A56] max-w-xs">
                    Explore our sacred Ayurvedic formulations to begin your wellness ritual.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#C89B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3A2B28] transition-colors shadow-sm"
                  >
                    Explore Formulations
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-2xl bg-[#F7EEE7] border border-[#C89B3C]/20 shadow-xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-xl bg-white p-2 border border-[#C89B3C]/10"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-sm font-medium text-[#3A2B28] leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#6D5A56] hover:text-[#B93847] p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-serif font-bold text-[#C89B3C] mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border border-[#C89B3C]/30 bg-white rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-[#C89B3C] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-[#C89B3C] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#3A2B28]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#3A2B28]/10 bg-[#F7EEE7] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6D5A56] uppercase tracking-wider text-xs">Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-[#C89B3C]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-[#6D5A56] leading-tight">
                  Taxes and shipping calculated at checkout. Standard delivery charge ₹49 for all orders across India.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-full bg-[#C89B3C] hover:bg-[#3A2B28] text-white text-xs font-bold uppercase tracking-widest text-center block transition-all shadow-lg interactive"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
