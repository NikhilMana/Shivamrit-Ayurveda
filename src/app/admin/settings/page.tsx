"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [storeName, setStoreName] = useState("Shivamrit Ayurveda");
  const [supportEmail, setSupportEmail] = useState("support@shivamritayurveda.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("Haridwar, Uttarakhand, India");
  const [saved, setSaved] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await (supabase.from("settings") as any).select("*").single();
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || "Shivamrit Ayurveda");
      setSupportEmail(settings.support_email || "support@shivamritayurveda.com");
      setSupportPhone(settings.support_phone || "+91 98765 43210");
      setAddress(settings.address || "Haridwar, Uttarakhand, India");
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase
        .from("settings") as any)
        .update({
          store_name: storeName,
          support_email: supportEmail,
          support_phone: supportPhone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings?.id || "f1111111-1111-1111-1111-111111111111");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800">Store Settings</h1>
        <p className="text-slate-500 text-sm">
          Update global sanctuary store contact information and branding details.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Support Email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Support Phone</label>
          <input
            type="text"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Store Address</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <button
          onClick={() => updateSettingsMutation.mutate()}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a392a] text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#234b37]"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
