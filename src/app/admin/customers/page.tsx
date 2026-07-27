"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function AdminCustomersPage() {
  const supabase = createClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("profiles") as any)
        .select("*, orders(count, total_amount)")
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800">Customer Directory</h1>
        <p className="text-slate-500 text-sm">
          Registered customer accounts and purchasing profiles.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading customer directory...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">
                      {c.full_name || "Anonymous Customer"}
                    </td>
                    <td className="p-4 text-xs font-mono">{c.phone || "N/A"}</td>
                    <td className="p-4 uppercase text-xs font-bold text-slate-500">
                      <span className={`px-2.5 py-1 rounded-full ${c.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
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
