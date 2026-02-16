"use client";

import { useState } from "react";
import { UITheme } from "@/types/cms";
import { saveTheme } from "@/app/admin/actions";

const FONT_OPTIONS = [
  "Sora", "Inter", "Poppins", "Outfit", "Nunito", "Montserrat", 
  "Public Sans", "DM Sans", "Plus Jakarta Sans", "Roboto", "Open Sans"
];

export default function ThemeEditor({ initialTheme }: { initialTheme: UITheme }) {
  const [theme, setTheme] = useState<UITheme>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const update = (key: keyof UITheme, value: string | number) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await saveTheme(theme);
      setMsg("✅ Theme berhasil disimpan!");
    } catch (err) {
      setMsg("❌ Gagal menyimpan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Theme & Branding</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? "Menyimpan..." : "Simpan Theme"}
        </button>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg}
        </div>
      )}

      {/* Colors */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Warna</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "primary_color" as const, label: "Primary" },
            { key: "secondary_color" as const, label: "Secondary" },
            { key: "background_color" as const, label: "Background" },
            { key: "text_color" as const, label: "Text" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">{label}</label>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                <input
                  type="color"
                  value={theme[key] as string}
                  onChange={(e) => update(key, e.target.value)}
                  className="size-8 rounded cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={theme[key] as string}
                  onChange={(e) => update(key, e.target.value)}
                  className="flex-1 text-xs font-mono bg-transparent border-none outline-none uppercase"
                  maxLength={9}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Font</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "heading_font" as const, label: "Heading Font" },
            { key: "body_font" as const, label: "Body Font" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">{label}</label>
              <select
                value={theme[key] as string}
                onChange={(e) => update(key, e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Border Radius (px)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "button_radius" as const, label: "Button Radius" },
            { key: "card_radius" as const, label: "Card Radius" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">{label}: {theme[key]}px</label>
              <input
                type="range"
                min={0}
                max={24}
                value={theme[key] as number}
                onChange={(e) => update(key, parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Swatch */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Preview</h4>
        <div 
          className="p-6 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4"
          style={{ backgroundColor: theme.background_color }}
        >
          <div 
            className="px-5 py-2 text-white text-sm font-bold"
            style={{ 
              backgroundColor: theme.primary_color,
              borderRadius: `${theme.button_radius}px` 
            }}
          >
            Button Preview
          </div>
          <div 
            className="px-5 py-2 text-white text-sm font-bold"
            style={{ 
              backgroundColor: theme.secondary_color,
              borderRadius: `${theme.button_radius}px` 
            }}
          >
            Secondary
          </div>
          <span style={{ color: theme.text_color, fontFamily: theme.heading_font }} className="text-lg font-bold">
            Heading Text
          </span>
          <span style={{ color: theme.text_color, fontFamily: theme.body_font }} className="text-sm">
            Body text preview
          </span>
        </div>
      </div>
    </div>
  );
}
