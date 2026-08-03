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
  ExternalLink,
  AlertCircle,
  XCircle,
  RotateCcw,
  X
} from "lucide-react";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: { tracking: string; courier: string } }>({});

  // Payment Recovery Modal State
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverPaymentId, setRecoverPaymentId] = useState("");
  const [recoverTargetEmail, setRecoverTargetEmail] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverError, setRecoverError] = useState<string | null>(null);

  // Handle Admin Payment Recovery
  const handleRecoverPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverPaymentId.trim()) return;
    setIsRecovering(true);
    setRecoverError(null);

    try {
      const res = await fetch("/api/admin/orders/recover-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: recoverPaymentId.trim(),
          target_email: recoverTargetEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to recover payment");

      alert(data.message || "Payment recovered successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setShowRecoverModal(false);
      setRecoverPaymentId("");
      setRecoverTargetEmail("");
    } catch (err: any) {
      setRecoverError(err.message || "An error occurred during payment recovery.");
    } finally {
      setIsRecovering(false);
    }
  };

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

  // Mutation to Approve / Reject Cancellation & Process Razorpay Refund
  const approveCancellationMutation = useMutation({
    mutationFn: async ({ id, action = "approve" }: { id: string; action?: "approve" | "reject" }) => {
      const res = await fetch("/api/admin/orders/cancel-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process cancellation request");
      return data;
    },
    onSuccess: (data) => {
      alert(data.message || "Cancellation approval processed successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: any) => {
      alert(`Error processing request: ${err.message}`);
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
    const line1 = addr.address_line_1 || addr.address_line1 || "";
    const line2 = addr.address_line_2 || addr.address_line2 || "";
    const city = addr.city || "";
    const state = addr.state || "";
    const pincode = addr.postal_code || "";

    const parts = [
      line1,
      line2,
      city,
      state ? (pincode ? `${state} - ${pincode}` : state) : pincode,
    ].filter(Boolean);

    const fullAddressStr = parts.length > 0 ? parts.join(", ") : "No address provided";

    const textToCopy = `Name: ${name}\nPhone: ${phone}\nAddress: ${fullAddressStr}`;

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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowRecoverModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#C89B3C] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1a392a] transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" /> Recover Missing Payment
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
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

            const isCancellationRequested = o.order_status === "cancellation_requested";

            return (
              <div
                key={o.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:border-slate-300 ${
                  isCancellationRequested ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-200"
                }`}
              >
                {/* Cancellation Request Action Banner */}
                {isCancellationRequested && (
                  <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Cancellation & Refund Requested
                        </p>
                        <p className="text-xs text-amber-800">
                          {o.cancel_reason
                            ? `Reason: "${o.cancel_reason}"`
                            : "Customer requested cancellation for this order."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        onClick={() => {
                          if (confirm(`Approve cancellation for order #${o.id.slice(0, 8).toUpperCase()}? If paid via Razorpay, refund of ₹${o.total_amount} will be automatically initiated.`)) {
                            approveCancellationMutation.mutate({ id: o.id, action: "approve" });
                          }
                        }}
                        disabled={approveCancellationMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{approveCancellationMutation.isPending ? "Processing..." : "Approve & Refund"}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Reject cancellation request and restore order #${o.id.slice(0, 8).toUpperCase()} to Confirmed?`)) {
                            approveCancellationMutation.mutate({ id: o.id, action: "reject" });
                          }
                        }}
                        disabled={approveCancellationMutation.isPending}
                        className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

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
                            : o.payment_status === "refunded"
                            ? "bg-purple-100 text-purple-800"
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
                      <option value="cancellation_requested">Cancellation Requested</option>
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
                        {addr.address_line_1 || addr.address_line1 || "No address line 1 provided"}
                      </p>
                      {(addr.address_line_2 || addr.address_line2) && (
                        <p className="text-slate-600 font-medium">{addr.address_line_2 || addr.address_line2}</p>
                      )}
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

      {/* Admin Recover Missing Payment Modal */}
      {showRecoverModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 p-6 sm:p-8 text-slate-800 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowRecoverModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FFF8F4] border border-[#C89B3C]/20 text-[#C89B3C] flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">
              Recover Missing Payment
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter any captured Razorpay Payment ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">pay_TKazDbLVjC3Aj8</code>). The system will fetch payment & item credentials directly from Razorpay and create the order under the customer's profile.
            </p>

            {recoverError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recoverError}</span>
              </div>
            )}

            <form onSubmit={handleRecoverPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razorpay Payment ID *
                </label>
                <input
                  type="text"
                  required
                  value={recoverPaymentId}
                  onChange={(e) => setRecoverPaymentId(e.target.value)}
                  placeholder="e.g. pay_TKazDbLVjC3Aj8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C89B3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Email (Optional Override)
                </label>
                <input
                  type="email"
                  value={recoverTargetEmail}
                  onChange={(e) => setRecoverTargetEmail(e.target.value)}
                  placeholder="e.g. shashankmana@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C89B3C]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecoverModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="px-5 py-2.5 rounded-xl bg-[#C89B3C] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isRecovering ? "Recovering..." : "Recover & Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
