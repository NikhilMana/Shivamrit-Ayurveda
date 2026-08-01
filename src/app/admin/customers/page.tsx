"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  ShoppingBag, 
  IndianRupee, 
  Copy, 
  Check, 
  UserCheck, 
  ShieldCheck 
} from "lucide-react";

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch customers with associated orders and saved addresses
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("profiles") as any)
        .select("*, orders(id, total_amount, order_status), addresses(phone)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers directory:", error);
        return [];
      }

      return (data as any) || [];
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered customer list based on search term
  const filteredCustomers = customers.filter((c: any) => {
    const q = searchQuery.toLowerCase();
    const name = (c.full_name || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || c.addresses?.[0]?.phone || "").toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  // Calculate high-level stats
  const totalCustomers = customers.length;
  const totalOrdersCount = customers.reduce((sum: number, c: any) => sum + (c.orders?.length || 0), 0);
  const totalRevenue = customers.reduce((sum: number, c: any) => {
    const validOrders = c.orders?.filter((o: any) => o.order_status !== "cancelled") || [];
    const customerTotal = validOrders.reduce((acc: number, o: any) => acc + Number(o.total_amount || 0), 0);
    return sum + customerTotal;
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Customer Directory</h1>
          <p className="text-slate-500 text-sm">
            View registered customer profiles, contact numbers, emails, order counts, and lifetime purchase value.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#C89B3C] bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total Customers</p>
            <p className="font-serif text-2xl font-bold text-slate-800">{totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total Customer Orders</p>
            <p className="font-serif text-2xl font-bold text-slate-800">{totalOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FFF8F4] text-[#C89B3C] border border-[#C89B3C]/20 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total Lifetime Value</p>
            <p className="font-serif text-2xl font-bold text-[#C89B3C]">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Customers Directory Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-serif text-lg">Loading customer directory...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-serif text-lg font-medium text-slate-700">No customers found</p>
          <p className="text-xs text-slate-400">Registered customers will appear here with full contact details.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Customer Name & Email</th>
                  <th className="p-4">Mobile Phone Number</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c: any) => {
                  const phoneNum = c.phone || c.addresses?.[0]?.phone || "N/A";
                  const validOrders = c.orders?.filter((o: any) => o.order_status !== "cancelled") || [];
                  const spent = validOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
                  const ordersCount = c.orders?.length || 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1a392a] text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                            {c.full_name?.charAt(0)?.toUpperCase() || c.email?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {c.full_name || "Valued Customer"}
                            </p>
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                className="text-xs text-slate-500 hover:text-[#C89B3C] flex items-center gap-1 mt-0.5"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{c.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-mono">
                        {phoneNum !== "N/A" ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${phoneNum}`}
                              className="font-bold text-[#C89B3C] hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{phoneNum}</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(phoneNum, c.id)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Copy Phone"
                            >
                              {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          <ShoppingBag className="w-3 h-3 text-slate-500" />
                          <span>{ordersCount} {ordersCount === 1 ? "order" : "orders"}</span>
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{spent.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            c.role === "admin"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {c.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>{c.role || "customer"}</span>
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-400">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
