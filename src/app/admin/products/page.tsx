"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, Check, Star, RefreshCw } from "lucide-react";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("products") as any)
        .select("*, product_images(*)")
        .order("created_at", { ascending: false });
      return (data as any[]) || [];
    },
  });

  // Update Stock & Price Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      stock,
      price,
      featured,
    }: {
      id: string;
      stock?: number;
      price?: number;
      featured?: boolean;
    }) => {
      const updates: any = {};
      if (stock !== undefined) updates.stock = stock;
      if (price !== undefined) updates.price = price;
      if (featured !== undefined) updates.featured = featured;

      const { error } = await (supabase.from("products") as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setEditingProduct(null);
    },
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("products") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Product Catalog Management</h1>
          <p className="text-slate-500 text-sm">
            Manage product inventory, pricing, featured status, and catalog listings.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading catalog...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4 text-xs font-mono">{p.category_id || "Care"}</td>
                    <td className="p-4 font-bold text-slate-800">₹{p.price}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.stock < 30 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() =>
                          updateMutation.mutate({ id: p.id, featured: !p.featured })
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.featured
                            ? "bg-amber-50 border-amber-300 text-amber-600"
                            : "text-slate-300 border-slate-200 hover:text-slate-400"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setNewStock(p.stock);
                          setNewPrice(Number(p.price));
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-800">
              Edit Product: {editingProduct.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Count</label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="w-1/2 py-2.5 border rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: editingProduct.id,
                    price: newPrice,
                    stock: newStock,
                  })
                }
                className="w-1/2 py-2.5 bg-[#1a392a] text-white rounded-xl font-bold text-xs hover:bg-[#234b37]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
