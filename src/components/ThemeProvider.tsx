"use client";

import { useEffect } from "react";
import { UITheme } from "@/types/cms";
import { DEFAULT_THEME } from "@/lib/theme-defaults";

interface ThemeProviderProps {
  theme: UITheme;
  children: React.ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const t = { ...DEFAULT_THEME, ...theme };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", t.primary_color);
    root.style.setProperty("--theme-secondary", t.secondary_color);
    root.style.setProperty("--theme-bg", t.background_color);
    root.style.setProperty("--theme-text", t.text_color);
    root.style.setProperty("--theme-heading-font", t.heading_font === 'Sour Gummy' ? 'var(--font-sour-gummy), ui-sans-serif, system-ui, sans-serif' : `"${t.heading_font}", ui-sans-serif, system-ui, sans-serif`);
    root.style.setProperty("--theme-body-font", t.body_font === 'Sour Gummy' ? 'var(--font-sour-gummy), ui-sans-serif, system-ui, sans-serif' : `"${t.body_font}", ui-sans-serif, system-ui, sans-serif`);
    root.style.setProperty("--theme-btn-radius", `${t.button_radius}px`);
    root.style.setProperty("--theme-card-radius", `${t.card_radius}px`);
    root.style.setProperty("--theme-card-bg", t.card_bg_color);
    root.style.setProperty("--theme-card-border", t.card_border_color);
    root.style.setProperty("--theme-search-bg", t.search_bg_color);
    root.style.setProperty("--theme-search-text", t.search_text_color);
    root.style.setProperty("--theme-account-bg", t.account_bg_color);
    root.style.setProperty("--theme-account-text", t.account_text_color);
  }, [
    t.primary_color, 
    t.secondary_color, 
    t.background_color, 
    t.text_color, 
    t.heading_font, 
    t.body_font, 
    t.button_radius, 
    t.card_radius,
    t.card_bg_color,
    t.card_border_color,
    t.search_bg_color,
    t.search_text_color,
    t.account_bg_color,
    t.account_text_color
  ]);

  // Dynamically load Google Fonts (Exclude local fonts like 'Sour Gummy')
  useEffect(() => {
    const fonts = [t.heading_font, t.body_font].filter(f => f && f !== 'Sour Gummy');
    const uniqueFonts = [...new Set(fonts)];
    
    uniqueFonts.forEach((font) => {
      const linkId = `gfont-${font.replace(/\s+/g, "-").toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [t.heading_font, t.body_font]);

  return <>{children}</>;
}
