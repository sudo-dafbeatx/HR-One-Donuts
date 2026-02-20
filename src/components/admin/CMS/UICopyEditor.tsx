"use client";

import { useState } from "react";
import { saveUICopyBatch } from "@/app/admin/actions";

interface UICopyEditorProps {
  initialCopy: Record<string, string>;
}

const COPY_GROUPS: { title: string; keys: { key: string; label: string }[] }[] = [
  {
    title: "Navigasi",
    keys: [
      { key: "nav_home", label: "Label: Home" },
      { key: "nav_menu", label: "Label: Menu" },
      { key: "nav_how_to_order", label: "Label: Cara Pesan" },
      { key: "nav_account", label: "Label: Account" },
      { key: "search_placeholder", label: "Placeholder Pencarian" },
      { key: "cta_search", label: "Tombol Cari" },
    ]
  },
  {
    title: "Banner Promo",
    keys: [
      { key: "banner_1_label", label: "Banner 1 - Label" },
      { key: "banner_1_title", label: "Banner 1 - Judul" },
      { key: "banner_1_subtitle", label: "Banner 1 - Subtitle" },
      { key: "banner_2_label", label: "Banner 2 - Label" },
      { key: "banner_2_title", label: "Banner 2 - Judul" },
      { key: "banner_2_subtitle", label: "Banner 2 - Subtitle" },
      { key: "banner_3_label", label: "Banner 3 - Label" },
      { key: "banner_3_title", label: "Banner 3 - Judul" },
      { key: "banner_3_subtitle", label: "Banner 3 - Subtitle" },
      { key: "section_flash_sale_subtitle", label: "Flash Sale - Subtitle" },
      { key: "cta_view_all", label: "Tombol Lihat Semua" },
      { key: "cta_view_promo", label: "Tombol Lihat Promo" },
    ]
  },
  {
    title: "Katalog Produk",
    keys: [
      { key: "section_catalog", label: "Judul Section" },
      { key: "section_catalog_desc", label: "Deskripsi Section" },
      { key: "category_all", label: "Label Kategori: Semua" },
      { key: "cta_add_cart", label: "Tombol Tambah Keranjang" },
      { key: "cta_buy", label: "Tombol Beli" },
      { key: "loading_add_cart", label: "Pesan Loading Keranjang" },
      { key: "sold_label", label: "Label Terjual" },
    ]
  },
  {
    title: "Badge Produk",
    keys: [
      { key: "badge_promo", label: "Badge Promo" },
      { key: "badge_limited", label: "Badge Limited" },
      { key: "badge_bestseller", label: "Badge Terlaris" },
    ]
  },
  {
    title: "Footer",
    keys: [
      { key: "footer_copyright", label: "Copyright" },
      { key: "footer_navigation", label: "Judul Navigasi" },
      { key: "footer_help", label: "Judul Bantuan" },
      { key: "footer_quicklinks", label: "Judul Quick Links" },
      { key: "footer_support", label: "Judul Support" },
      { key: "footer_contact", label: "Judul Contact" },
    ]
  },
  {
    title: "Pesan Kosong",
    keys: [
      { key: "empty_products", label: "Tidak ada produk" },
      { key: "empty_category", label: "Kategori kosong" },
    ]
  },
];

export default function UICopyEditor({ initialCopy }: UICopyEditorProps) {
  const [copy, setCopy] = useState<Record<string, string>>(initialCopy);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");

  const handleChange = (key: string, value: string) => {
    setCopy(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const entries = Object.entries(copy).map(([key, value]) => ({ key, value }));
      await saveUICopyBatch(entries);
      setMsg("✅ Teks UI berhasil disimpan!");
    } catch (err) {
      setMsg("❌ Gagal menyimpan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = COPY_GROUPS.map(group => ({
    ...group,
    keys: group.keys.filter(k => 
      !filter || k.label.toLowerCase().includes(filter.toLowerCase()) || k.key.toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(g => g.keys.length > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-800">UI Text Manager</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari teks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {saving ? "Menyimpan..." : "Simpan Semua"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg}
        </div>
      )}

      {filteredGroups.map((group) => (
        <div key={group.title}>
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            {group.title}
          </h4>
          <div className="space-y-2">
            {group.keys.map(({ key, label }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                <div className="sm:w-48 shrink-0">
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">{key}</span>
                </div>
                <input
                  type="text"
                  value={copy[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
