"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle } from "lucide-react";

export default function AdminOverviewPage() {
  const supabase = createClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: productCount },
        { count: orderCount },
        { count: customerCount },
        { data: orders },
        { data: lowStockProducts },
      ] = await Promise.all([
        (supabase.from("products") as any).select("*", { count: "exact", head: true }),
        (supabase.from("orders") as any).select("*", { count: "exact", head: true }),
        (supabase.from("profiles") as any).select("*", { count: "exact", head: true }),
        (supabase.from("orders") as any).select("total_amount"),
        (supabase.from("products") as any).select("id, name, stock").lt("stock", 30),
      ]);

      const totalRevenue = (orders || []).reduce(
        (sum: number, o: any) => sum + Number(o.total_amount || 0),
        0
      );

      return {
        productCount: productCount || 0,
        orderCount: orderCount || 0,
        customerCount: customerCount || 0,
        totalRevenue,
        lowStockProducts: lowStockProducts || [],
      };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">
          Real-time sanctuary business analytics and inventory alerts.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">
              ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.orderCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Live Products</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.productCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Customers</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.customerCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Inventory & Low Stock Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-bold text-slate-800 text-lg">Inventory & Low Stock Watchlist</h2>
        </div>

        {stats?.lowStockProducts.length === 0 ? (
          <p className="text-sm text-slate-500">All product stock levels are healthy.</p>
        ) : (
          <div className="divide-y border rounded-xl overflow-hidden">
            {stats?.lowStockProducts.map((p: any) => (
              <div key={p.id} className="p-4 flex items-center justify-between bg-slate-50">
                <span className="font-medium text-slate-800 text-sm">{p.name}</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {p.stock} remaining in stock
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
