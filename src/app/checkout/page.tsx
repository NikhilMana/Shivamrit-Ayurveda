"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotals, clearCart } = useCartStore();
  const { totalItems, totalPrice } = getTotals();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("cod");

  // Created Order State for Confirmation
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    // Load Razorpay SDK Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const shippingCharge = 49;
  const finalTotal = totalPrice + shippingCharge;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      setError("Please fill in all required shipping address fields.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in to place an order.");
        setLoading(false);
        return;
      }

      // Save or reuse existing address
      const { data: existingAddresses } = await (supabase
        .from("addresses") as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("address_line_1", addressLine1.trim())
        .eq("postal_code", postalCode.trim())
        .limit(1);

      let addressId = existingAddresses && existingAddresses.length > 0 ? existingAddresses[0].id : null;

      if (!addressId) {
        const { data: addressData, error: addressError } = await (supabase
          .from("addresses") as any)
          .insert({
            user_id: user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            address_line_1: addressLine1.trim(),
            address_line_2: addressLine2 ? addressLine2.trim() : null,
            city: city.trim(),
            state: state.trim(),
            postal_code: postalCode.trim(),
            country: "India",
            is_default: true,
          })
          .select("id")
          .single();

        if (addressError) throw addressError;
        addressId = addressData.id;
      }

      if (paymentMethod === "cod") {
        // Place COD Order directly
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address_id: addressId,
            items: items.map((i) => ({
              product_id: i.id,
              quantity: i.quantity,
              price: i.price,
            })),
            subtotal: totalPrice,
            shipping_charge: shippingCharge,
            total_amount: finalTotal,
            payment_method: "cod",
          }),
        });

        const orderResult = await res.json();
        if (!res.ok) throw new Error(orderResult.error || "Order placement failed");

        setCompletedOrder(orderResult.order);
        clearCart();
        setStep(4);
      } else {
        // Razorpay Online Payment Flow
        const res = await fetch("/api/checkout/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
          }),
        });

        const razorpayData = await res.json();
        if (!res.ok) throw new Error(razorpayData.error || "Razorpay initialization failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TIRQvygPZydvEl",
          amount: razorpayData.order.amount,
          currency: "INR",
          name: "Shivamrit Ayurveda",
          description: "Sanctuary Care Order",
          order_id: razorpayData.order.id,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address_id: addressId,
                items: items.map((i) => ({
                  product_id: i.id,
                  quantity: i.quantity,
                  price: i.price,
                })),
                subtotal: totalPrice,
                shipping_charge: shippingCharge,
                total_amount: finalTotal,
              }),
            });

            const verifyResult = await verifyRes.json();
            if (verifyRes.ok) {
              setCompletedOrder(verifyResult.order);
              clearCart();
              setStep(4);
            } else {
              setError("Payment verification failed.");
            }
          },
          prefill: {
            name: fullName,
            contact: phone,
          },
          theme: {
            color: "#1a392a",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-[#FFF8F4] flex flex-col items-center justify-center pt-32 px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-[#C89B3C] mb-4" />
        <h1 className="font-serif text-3xl font-bold text-[#3A2B28] mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-6">
          Add authentic Ayurvedic preparations to your cart to proceed with checkout.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-[#1a392a] text-white rounded-xl text-sm font-medium hover:bg-[#234b37] transition-colors"
        >
          Explore Sanctuary Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#3A2B28] pt-32 pb-24 px-4 md:px-12">
      <div className="container mx-auto max-w-5xl">
        {/* Checkout Header & Steps Navigation */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#1a392a] mb-6">
            Sanctuary Checkout
          </h1>

          <div className="flex items-center justify-center gap-2 md:gap-6 text-sm max-w-2xl mx-auto">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-[#1a392a] font-bold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  step >= 1
                    ? "bg-[#1a392a] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline">Address</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-[#1a392a] font-bold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  step >= 2
                    ? "bg-[#1a392a] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-[#1a392a] font-bold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  step >= 3
                    ? "bg-[#1a392a] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Shipping Address */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl border border-[#C89B3C]/20 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#C89B3C]" />
              <h2 className="font-serif text-2xl font-bold text-[#1a392a]">
                Step 1: Shipping Address
              </h2>
            </div>

            <form onSubmit={handleNextStep1} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient Full Name"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House / Flat No., Building Name, Street"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Landmark, Area"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a392a] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#1a392a] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#234b37] transition-colors mt-6"
              >
                Proceed to Payment Method
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Payment Method */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-3xl border border-[#C89B3C]/20 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#C89B3C]" />
              <h2 className="font-serif text-2xl font-bold text-[#1a392a]">
                Step 2: Select Payment Method
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              <label
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#1a392a] bg-[#F7EEE7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-[#1a392a] w-5 h-5"
                />
                <div>
                  <p className="font-bold text-[#1a392a]">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-600">
                    Pay with cash upon delivery at your doorstep
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-[#1a392a] bg-[#F7EEE7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="accent-[#1a392a] w-5 h-5"
                />
                <div>
                  <p className="font-bold text-[#1a392a]">Online Payment (Razorpay)</p>
                  <p className="text-xs text-gray-600">
                    UPI, Credit/Debit Cards, NetBanking, Paytm, Google Pay
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 bg-[#1a392a] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#234b37] transition-colors"
              >
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Order Review */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#C89B3C]/20 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1a392a]">
                Step 3: Review Order
              </h2>

              {/* Address Summary */}
              <div className="p-4 rounded-2xl bg-[#FFF8F4] border border-[#C89B3C]/15">
                <p className="text-xs uppercase tracking-wider text-[#C89B3C] font-bold mb-1">
                  Deliver To:
                </p>
                <p className="font-bold text-[#3A2B28]">{fullName} ({phone})</p>
                <p className="text-sm text-gray-600">
                  {addressLine1}, {addressLine2 ? `${addressLine2}, ` : ""}{city},{" "}
                  {state} - {postalCode}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F7EEE7] p-1 border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#3A2B28] text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} x ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#1a392a]">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white p-8 rounded-3xl border border-[#C89B3C]/20 shadow-sm h-fit space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1a392a]">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm border-b pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Standard Delivery Charge</span>
                  <span className="font-bold text-[#1a392a]">₹49</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg text-[#1a392a]">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>

              <button
                disabled={loading}
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#C89B3C] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#1a392a] disabled:opacity-50 transition-colors shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <span>Place Order (₹{finalTotal})</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Order Confirmation */}
        {step === 4 && completedOrder && (
          <div className="bg-white p-12 rounded-3xl border border-[#C89B3C]/20 shadow-xl max-w-2xl mx-auto text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-[#166534] mx-auto" />
            <h2 className="font-serif text-3xl font-bold text-[#1a392a]">
              Order Confirmed!
            </h2>
            <p className="text-gray-600 text-sm">
              Thank you for choosing Shivamrit Ayurveda. Your order{" "}
              <strong className="text-[#1a392a]">#{completedOrder.id}</strong> has been successfully placed.
            </p>

            <div className="p-6 rounded-2xl bg-[#FFF8F4] border text-left space-y-2 text-sm">
              <p>
                <strong>Payment Method:</strong>{" "}
                <span className="uppercase">{completedOrder.payment_method}</span>
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{completedOrder.total_amount}
              </p>
              <p>
                <strong>Order Status:</strong>{" "}
                <span className="capitalize text-[#166534] font-bold">
                  {completedOrder.order_status}
                </span>
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/account"
                className="px-6 py-3 bg-[#1a392a] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#234b37]"
              >
                Track Order Status
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
