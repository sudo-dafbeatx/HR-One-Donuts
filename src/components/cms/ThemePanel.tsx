'use client';

import { useState } from 'react';
import { useEditMode } from '@/context/EditModeContext';
import { UITheme } from '@/types/cms';

const FONT_OPTIONS = [
  "Sora",
  "Public Sans",
  "Inter",
  "Roboto",
  "Poppins",
  "Playfair Display",
  "Montserrat",
  "Lato",
  "Oswald",
  "Sour Gummy",
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
    const fontVal = value === 'Sour Gummy' ? 'var(--font-sour-gummy)' : `"${value}"`;
    if (key === 'heading_font') root.style.setProperty('--theme-heading-font', `${fontVal}, ui-sans-serif, system-ui, sans-serif`);
    if (key === 'body_font') root.style.setProperty('--theme-body-font', `${fontVal}, ui-sans-serif, system-ui, sans-serif`);
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

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    setPanelOpen(next);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={toggle}
        className="fixed bottom-5 left-5 z-[9999] size-11 rounded-[13px] bg-slate-900/90 backdrop-blur-xl text-white border border-slate-700 shadow-xl flex items-center justify-center hover:bg-slate-800/90 active:scale-[0.95] transition-all duration-200 editor-control"
        title="Theme"
      >
        <span className="material-symbols-outlined text-[18px]">palette</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div 
          data-editor-panel
          className="fixed inset-y-0 left-0 z-[9999] w-[300px] bg-white/98 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col shadow-2xl shadow-slate-200/50 editor-control"
          style={{ animation: 'slide-in-left 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="size-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-[16px]">palette</span>
              </span>
              <span className="text-[13px] font-semibold text-slate-800 tracking-tight">Theme</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasChanges && (
                <button 
                  onClick={handleSave}
                  className="h-7 px-3 bg-slate-900 text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 transition-colors editor-control"
                >
                  Simpan
                </button>
              )}
              <button 
                onClick={toggle}
                className="size-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors editor-control"
              >
                <span className="material-symbols-outlined text-slate-400 text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Color Groups */}
              {COLOR_GROUPS.map(group => (
                <div key={group.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">{group.title}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.fields.map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">{label}</label>
                        <div className="flex items-center gap-1.5 h-8 bg-slate-50/80 rounded-lg px-1.5 border border-slate-200/60">
                          <input
                            type="color"
                            value={(localTheme[key] as string) || '#000000'}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="size-5 rounded-md cursor-pointer border-none shrink-0 editor-control"
                          />
                          <input
                            type="text"
                            value={(localTheme[key] as string) || ''}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="flex-1 text-[10px] font-mono bg-transparent border-none outline-none uppercase w-full text-slate-600 editor-control"
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">Font</div>
                <div className="space-y-2.5">
                  {[
                    { key: 'heading_font' as const, label: 'Heading' },
                    { key: 'body_font' as const, label: 'Body' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500">{label}</label>
                      <select
                        value={localTheme[key] as string}
                        onChange={(e) => handleFontChange(key, e.target.value)}
                        className="w-full h-8 px-2.5 bg-slate-50/80 border border-slate-200/60 rounded-lg text-[12px] text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 editor-control"
                      >
                        {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">Radius</div>
                <div className="space-y-3">
                  {[
                    { key: 'button_radius' as const, label: 'Button' },
                    { key: 'card_radius' as const, label: 'Card' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-medium text-slate-500">{label}</label>
                        <span className="text-[11px] font-mono text-slate-400">{localTheme[key]}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={24}
                        value={localTheme[key] as number}
                        onChange={(e) => handleRadiusChange(key, parseInt(e.target.value))}
                        className="w-full accent-slate-900 editor-control"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
