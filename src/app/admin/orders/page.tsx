"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { 
  Copy, 
  Check, 
  Phone, 
  MapPin, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Search,
  ExternalLink
} from "lucide-react";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: { tracking: string; courier: string } }>({});

  // Fetch orders with profiles, addresses, and order items
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("orders") as any)
        .select("*, profiles(full_name, phone), addresses(*), order_items(*, products(*))")
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
  });

  // Mutation to update Order Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase
        .from("orders") as any)
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  // Mutation to save Tracking Number & Courier Name
  const saveTrackingMutation = useMutation({
    mutationFn: async ({ id, tracking_number, courier_name }: { id: string; tracking_number: string; courier_name: string }) => {
      const { error } = await (supabase
        .from("orders") as any)
        .update({ 
          tracking_number, 
          courier_name, 
          order_status: "shipped", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      alert("Tracking details saved & order marked as Shipped!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const copyFullAddress = (o: any) => {
    const addr = o.addresses || {};
    const name = addr.full_name || o.profiles?.full_name || "Customer";
    const phone = addr.phone || o.profiles?.phone || "N/A";
    const line1 = addr.address_line1 || "";
    const line2 = addr.address_line2 ? `, ${addr.address_line2}` : "";
    const city = addr.city || "";
    const state = addr.state || "";
    const pincode = addr.postal_code || "";

    const textToCopy = `Name: ${name}\nPhone: ${phone}\nAddress: ${line1}${line2}, ${city}, ${state} - ${pincode}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedAddressId(o.id);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  const copyPhone = (phone: string, orderId: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(orderId);
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  const filteredOrders = orders.filter((o: any) => {
    const q = searchQuery.toLowerCase();
    const orderId = o.id.toLowerCase();
    const custName = (o.profiles?.full_name || "").toLowerCase();
    const addrName = (o.addresses?.full_name || "").toLowerCase();
    const phone = (o.addresses?.phone || o.profiles?.phone || "").toLowerCase();
    const city = (o.addresses?.city || "").toLowerCase();
    return orderId.includes(q) || custName.includes(q) || addrName.includes(q) || phone.includes(q) || city.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Customer Orders</h1>
          <p className="text-slate-500 text-sm">
            View full delivery details, customer contact numbers, ordered items, and update shipping statuses.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#C89B3C] bg-white shadow-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-serif text-lg">Loading customer orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-serif text-lg font-medium text-slate-700">No orders found</p>
          <p className="text-xs text-slate-400">Orders placed by customers will appear here with full delivery credentials.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o: any) => {
            const addr = o.addresses || {};
            const custName = addr.full_name || o.profiles?.full_name || "Customer";
            const custPhone = addr.phone || o.profiles?.phone || "N/A";
            const isExpanded = expandedOrderId === o.id;

            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Order Header Summary */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#FFF8F4] border border-[#C89B3C]/20 text-[#C89B3C] shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(o.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{custName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Total Amount</p>
                      <p className="font-serif text-lg font-bold text-[#C89B3C]">₹{o.total_amount}</p>
                    </div>

                    {/* Payment Badge */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-bold text-slate-500">{o.payment_method}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </div>

                    {/* Order Status Select */}
                    <select
                      value={o.order_status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: o.id,
                          status: e.target.value,
                        })
                      }
                      className="p-2 border rounded-xl bg-white text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:border-[#C89B3C]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => toggleExpand(o.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition-colors text-slate-600"
                      title={isExpanded ? "Collapse Details" : "View Full Delivery Credentials"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Delivery Credentials & Order Details Drawer */}
                <div className="p-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Full Delivery Address */}
                  <div className="p-4 rounded-xl bg-[#FFF8F4] border border-[#C89B3C]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#C89B3C] tracking-wider">
                        <MapPin className="w-4 h-4 text-[#C89B3C]" />
                        <span>Delivery Address</span>
                      </div>
                      <button
                        onClick={() => copyFullAddress(o)}
                        className="flex items-center gap-1 text-[11px] bg-white border border-[#C89B3C]/30 text-[#C89B3C] hover:bg-[#C89B3C] hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all shadow-xs"
                      >
                        {copiedAddressId === o.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1 pt-1 font-sans leading-relaxed">
                      <p className="font-bold text-slate-900 text-sm">{custName}</p>
                      
                      {/* Phone Number with Click-to-Call & Copy */}
                      <div className="flex items-center gap-2 text-slate-800 py-0.5">
                        <a href={`tel:${custPhone}`} className="font-mono font-bold text-[#C89B3C] hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{custPhone}</span>
                        </a>
                        <button
                          onClick={() => copyPhone(custPhone, o.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 bg-white px-1.5 py-0.5 rounded border"
                        >
                          {copiedPhoneId === o.id ? "Copied" : "Copy Phone"}
                        </button>
                      </div>

                      <p className="text-slate-600 font-medium">
                        {addr.address_line1 || "No address line 1 provided"}
                      </p>
                      {addr.address_line2 && <p className="text-slate-600 font-medium">{addr.address_line2}</p>}
                      <p className="font-bold text-slate-800 pt-1">
                        {addr.city ? `${addr.city}, ` : ""}{addr.state ? `${addr.state} ` : ""}{addr.postal_code ? `- ${addr.postal_code}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Ordered Products */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">
                        Ordered Formulations ({o.order_items?.length || 0})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {o.order_items && o.order_items.length > 0 ? (
                        o.order_items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                            <img
                              src={item.products?.images?.[0] || "/assets/combo pack.png"}
                              alt={item.products?.name || "Product"}
                              className="w-10 h-10 object-contain rounded bg-slate-50 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {item.products?.name || "Product Item"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Qty: <span className="font-bold text-slate-800">{item.quantity}</span> × ₹{item.price}
                              </p>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#C89B3C]">
                              ₹{item.quantity * item.price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No item details available</p>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Dispatch & Tracking Number Entry */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-slate-500" /> Manual Courier Tracking
                    </span>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Courier Service Name</label>
                        <input
                          type="text"
                          placeholder="e.g. India Post, BlueDart, Delhivery"
                          value={trackingInputs[o.id]?.courier ?? o.courier_name ?? ""}
                          onChange={(e) =>
                            setTrackingInputs({
                              ...trackingInputs,
                              [o.id]: {
                                courier: e.target.value,
                                tracking: trackingInputs[o.id]?.tracking ?? o.tracking_number ?? "",
                              },
                            })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C89B3C] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">AWB Tracking Number</label>
                        <input
                          type="text"
                          placeholder="e.g. AWB987654321"
                          value={trackingInputs[o.id]?.tracking ?? o.tracking_number ?? ""}
                          onChange={(e) =>
                            setTrackingInputs({
                              ...trackingInputs,
                              [o.id]: {
                                tracking: e.target.value,
                                courier: trackingInputs[o.id]?.courier ?? o.courier_name ?? "",
                              },
                            })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C89B3C] bg-white font-mono"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const input = trackingInputs[o.id] || {};
                          const tracking = input.tracking ?? o.tracking_number ?? "";
                          const courier = input.courier ?? o.courier_name ?? "Courier";
                          if (!tracking) {
                            alert("Please enter a tracking number first.");
                            return;
                          }
                          saveTrackingMutation.mutate({
                            id: o.id,
                            tracking_number: tracking,
                            courier_name: courier,
                          });
                        }}
                        className="w-full mt-2 py-2 bg-[#C89B3C] hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                      >
                        Save & Mark Shipped
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
