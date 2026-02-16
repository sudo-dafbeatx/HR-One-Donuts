'use client';

import { useState } from 'react';
import { useEditMode } from '@/context/EditModeContext';
import { UITheme } from '@/types/cms';

const FONT_OPTIONS = [
  'Sora', 'Inter', 'Poppins', 'Outfit', 'Nunito', 'Montserrat',
  'Public Sans', 'DM Sans', 'Plus Jakarta Sans', 'Roboto', 'Open Sans'
];

interface ColorFieldConfig {
  key: keyof UITheme;
  label: string;
}

const COLOR_GROUPS: { title: string; fields: ColorFieldConfig[] }[] = [
  {
    title: 'Brand',
    fields: [
      { key: 'primary_color', label: 'Primary' },
      { key: 'secondary_color', label: 'Secondary' },
    ]
  },
  {
    title: 'Halaman',
    fields: [
      { key: 'background_color', label: 'Background' },
      { key: 'text_color', label: 'Teks' },
    ]
  },
  {
    title: 'Komponen',
    fields: [
      { key: 'card_bg_color', label: 'Card BG' },
      { key: 'card_border_color', label: 'Card Border' },
      { key: 'search_bg_color', label: 'Search BG' },
      { key: 'search_text_color', label: 'Search Teks' },
      { key: 'account_bg_color', label: 'Account BG' },
      { key: 'account_text_color', label: 'Account Teks' },
    ]
  },
];

export default function ThemePanel() {
  const { isEditMode, theme, updateTheme, setPanelOpen } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState<UITheme>(theme);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isEditMode) return null;

  const handleColorChange = (key: keyof UITheme, value: string) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    // Live preview: update CSS variable immediately
    const root = document.documentElement;
    const varMap: Partial<Record<keyof UITheme, string>> = {
      primary_color: '--theme-primary',
      secondary_color: '--theme-secondary',
      background_color: '--theme-bg',
      text_color: '--theme-text',
      card_bg_color: '--theme-card-bg',
      card_border_color: '--theme-card-border',
      search_bg_color: '--theme-search-bg',
      search_text_color: '--theme-search-text',
      account_bg_color: '--theme-account-bg',
      account_text_color: '--theme-account-text',
    };
    const cssVar = varMap[key];
    if (cssVar) root.style.setProperty(cssVar, value);
  };

  const handleFontChange = (key: keyof UITheme, value: string) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    const root = document.documentElement;
    if (key === 'heading_font') root.style.setProperty('--theme-heading-font', `"${value}", ui-sans-serif, system-ui, sans-serif`);
    if (key === 'body_font') root.style.setProperty('--theme-body-font', `"${value}", ui-sans-serif, system-ui, sans-serif`);
  };

  const handleRadiusChange = (key: keyof UITheme, value: number) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    const root = document.documentElement;
    if (key === 'button_radius') root.style.setProperty('--theme-btn-radius', `${value}px`);
    if (key === 'card_radius') root.style.setProperty('--theme-card-radius', `${value}px`);
  };

  const handleSave = async () => {
    await updateTheme(localTheme);
    setHasChanges(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          setPanelOpen(next);
        }}
        className="fixed bottom-20 md:bottom-6 left-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-2xl hover:shadow-xl transition-all editor-control"
      >
        <span className="material-symbols-outlined text-xl">palette</span>
        Theme
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 z-[250] w-80 bg-white shadow-2xl border-r border-slate-200 flex flex-col animate-slide-in-left">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800">🎨 Theme Editor</h3>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button 
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors editor-control"
                >
                  Simpan
                </button>
              )}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setPanelOpen(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors editor-control"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Color Groups */}
            {COLOR_GROUPS.map(group => (
              <div key={group.title}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{group.title}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {group.fields.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500">{label}</label>
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-1.5 border border-slate-200">
                        <input
                          type="color"
                          value={(localTheme[key] as string) || '#000000'}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="size-6 rounded cursor-pointer border-none shrink-0"
                        />
                        <input
                          type="text"
                          value={(localTheme[key] as string) || ''}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1 text-[10px] font-mono bg-transparent border-none outline-none uppercase w-full"
                          maxLength={9}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Fonts */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Font</h4>
              <div className="space-y-2">
                {[
                  { key: 'heading_font' as const, label: 'Heading' },
                  { key: 'body_font' as const, label: 'Body' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">{label}</label>
                    <select
                      value={localTheme[key] as string}
                      onChange={(e) => handleFontChange(key, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Border Radius</h4>
              <div className="space-y-2">
                {[
                  { key: 'button_radius' as const, label: 'Button' },
                  { key: 'card_radius' as const, label: 'Card' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">{label}: {localTheme[key]}px</label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={localTheme[key] as number}
                      onChange={(e) => handleRadiusChange(key, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
