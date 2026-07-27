"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Package,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Plus,
  Trash2,
  Star,
  X,
  AlertCircle,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");

  // Address Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Current User
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch User Orders
  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase.from("orders") as any)
        .select("*, order_items(*, products(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
    enabled: !!user,
  });

  // Fetch User Addresses
  const { data: rawAddresses = [] } = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase.from("addresses") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Deduplicate saved addresses list by address line & postal code for clean display
  const addresses = rawAddresses.filter(
    (addr: any, index: number, self: any[]) =>
      index ===
      self.findIndex(
        (t: any) =>
          t.address_line_1.toLowerCase().trim() === addr.address_line_1.toLowerCase().trim() &&
          t.postal_code.trim() === addr.postal_code.trim()
      )
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Add New Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      // Check duplicate
      const { data: existing } = await (supabase.from("addresses") as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("address_line_1", addressLine1.trim())
        .eq("postal_code", postalCode.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        setModalError("This address is already saved in your account.");
        setIsSubmitting(false);
        return;
      }

      // If set as default, reset other default flags
      if (isDefault) {
        await (supabase.from("addresses") as any)
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { error } = await (supabase.from("addresses") as any).insert({
        user_id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: "India",
        is_default: isDefault,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["user-addresses", user.id] });
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
    } catch (err: any) {
      setModalError(err.message || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(addressId);
    try {
      const { error } = await (supabase.from("addresses") as any)
        .delete()
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["user-addresses", user.id] });
    } catch (err: any) {
      alert("Failed to delete address: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Set Address as Default
  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
    try {
      await (supabase.from("addresses") as any)
        .update({ is_default: false })
        .eq("user_id", user.id);

      await (supabase.from("addresses") as any)
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", user.id);

      queryClient.invalidateQueries({ queryKey: ["user-addresses", user.id] });
    } catch (err: any) {
      alert("Failed to set default address: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#3A2B28] pt-28 sm:pt-36 pb-24 px-4 md:px-12">
      <div className="container mx-auto max-w-5xl">
        
        {/* Profile Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C89B3C]/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a392a] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#1a392a]">
                {profile?.full_name || "Valued Sanctuary Customer"}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 gap-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-[#1a392a] text-[#1a392a]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "addresses"
                ? "border-[#1a392a] text-[#1a392a]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({addresses.length})
          </button>
        </div>

        {/* TAB 1: Orders History */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-[#C89B3C]/20 text-center text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-serif text-lg font-medium text-gray-700">No orders placed yet.</p>
                <p className="text-xs text-gray-500 mt-1">Your ritual purchases will appear here.</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-[#C89B3C]/20 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <span className="text-xs text-gray-400 font-mono block">Order #{order.id}</span>
                      <span className="text-xs text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.order_status)}
                      <span className="font-bold text-[#1a392a]">₹{order.total_amount}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {item.products?.name || "Ayurvedic Product"} x {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Addresses Management */}
        {activeTab === "addresses" && (
          <div>
            {/* Header with Add Address Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-[#1a392a]">
                Saved Shipping Addresses
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a392a] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#234b37] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.length === 0 ? (
                <div className="col-span-2 bg-white p-12 rounded-3xl border border-[#C89B3C]/20 text-center text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-serif text-lg text-gray-700 font-medium">No saved addresses found.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Add New Address" above to save a delivery address.
                  </p>
                </div>
              ) : (
                addresses.map((addr: any) => (
                  <div
                    key={addr.id}
                    className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 relative ${
                      addr.is_default ? "border-[#C89B3C] ring-1 ring-[#C89B3C]/40" : "border-[#C89B3C]/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#1a392a] text-base">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89B3C]/15 text-[#C89B3C] border border-[#C89B3C]/30">
                            <Star className="w-3 h-3 fill-[#C89B3C]" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-2">{addr.phone}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {addr.address_line_1}
                        {addr.address_line_2 ? `, ${addr.address_line_2}` : ""},{" "}
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      {!addr.is_default ? (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs font-semibold text-[#C89B3C] hover:underline"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Default Delivery Address</span>
                      )}

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        disabled={deletingId === addr.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Add New Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#C89B3C]/30 p-6 sm:p-8 text-[#3A2B28] shadow-2xl relative my-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#1a392a] mb-1">Add New Shipping Address</h3>
            <p className="text-xs text-gray-500 mb-6">Enter your delivery details below.</p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House / Flat / Street Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Landmark, Apartment, Suite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="571438"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a392a]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#1a392a] rounded focus:ring-[#1a392a]"
                />
                <label htmlFor="defaultCheck" className="text-xs text-gray-700 font-medium">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1a392a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#234b37] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
