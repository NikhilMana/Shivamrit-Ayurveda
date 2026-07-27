"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Clock, CheckCircle2, Truck, XCircle, ChevronDown } from "lucide-react";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("orders") as any)
        .select("*, profiles(full_name, phone), order_items(*, products(*))")
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase
        .from("orders") as any)
        .update({ order_status: status as any, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800">Customer Orders</h1>
        <p className="text-slate-500 text-sm">
          Track and update customer fulfillment lifecycle statuses.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading orders...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total (₹)</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Update Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-700">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{o.profiles?.full_name || "Customer"}</p>
                      <p className="text-xs text-slate-400">{o.profiles?.phone || ""}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-800">₹{o.total_amount}</td>
                    <td className="p-4 uppercase text-xs font-semibold text-slate-500">
                      {o.payment_method}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-bold text-slate-700">
                        {o.order_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.order_status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: o.id,
                            status: e.target.value,
                          })
                        }
                        className="p-2 border rounded-xl bg-white text-xs font-bold text-slate-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
