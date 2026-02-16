'use client';

import { createContext, useContext, useState, useCallback, useTransition, ReactNode } from 'react';
import { UITheme } from '@/types/cms';
import { DEFAULT_THEME, DEFAULT_COPY } from '@/lib/theme-defaults';
import { saveTheme, saveUICopy } from '@/app/admin/actions';

interface EditModeContextType {
  isEditMode: boolean;
  isAdmin: boolean;
  toggleEditMode: () => void;
  copy: Record<string, string>;
  theme: UITheme;
  updateCopy: (key: string, value: string) => Promise<void>;
  updateTheme: (updates: Partial<UITheme>) => Promise<void>;
  isSaving: boolean;
  lastMessage: string;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  isAdmin: false,
  toggleEditMode: () => {},
  copy: DEFAULT_COPY,
  theme: DEFAULT_THEME,
  updateCopy: async () => {},
  updateTheme: async () => {},
  isSaving: false,
  lastMessage: '',
});

export function useEditMode() {
  return useContext(EditModeContext);
}

interface EditModeProviderProps {
  children: ReactNode;
  initialCopy: Record<string, string>;
  initialTheme: UITheme;
  isAdmin: boolean;
}

export function EditModeProvider({ children, initialCopy, initialTheme, isAdmin }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [copy, setCopy] = useState<Record<string, string>>(() => ({ ...DEFAULT_COPY, ...initialCopy }));
  const [theme, setTheme] = useState<UITheme>(() => ({ ...DEFAULT_THEME, ...initialTheme }));
  const [isSaving, setIsSaving] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [, startTransition] = useTransition();

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode(prev => !prev);
    setLastMessage('');
  }, [isAdmin]);

  const updateCopy = useCallback(async (key: string, value: string) => {
    const previousValue = copy[key];
    // Optimistic update
    setCopy(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);
    setLastMessage('');

    try {
      startTransition(async () => {
        await saveUICopy(key, value);
        setIsSaving(false);
        setLastMessage('✅ Tersimpan!');
        setTimeout(() => setLastMessage(''), 2000);
      });
    } catch {
      // Undo on failure
      setCopy(prev => ({ ...prev, [key]: previousValue }));
      setIsSaving(false);
      setLastMessage('❌ Gagal menyimpan');
      setTimeout(() => setLastMessage(''), 3000);
    }
  }, [copy]);

  const updateTheme = useCallback(async (updates: Partial<UITheme>) => {
    const previousTheme = { ...theme };
    const newTheme = { ...theme, ...updates };
    
    // Optimistic update
    setTheme(newTheme);
    
    // Also update CSS variables immediately
    const root = document.documentElement;
    if (updates.primary_color) root.style.setProperty('--theme-primary', updates.primary_color);
    if (updates.secondary_color) root.style.setProperty('--theme-secondary', updates.secondary_color);
    if (updates.background_color) root.style.setProperty('--theme-bg', updates.background_color);
    if (updates.text_color) root.style.setProperty('--theme-text', updates.text_color);
    if (updates.heading_font) root.style.setProperty('--theme-heading-font', `"${updates.heading_font}", ui-sans-serif, system-ui, sans-serif`);
    if (updates.body_font) root.style.setProperty('--theme-body-font', `"${updates.body_font}", ui-sans-serif, system-ui, sans-serif`);
    if (updates.button_radius !== undefined) root.style.setProperty('--theme-btn-radius', `${updates.button_radius}px`);
    if (updates.card_radius !== undefined) root.style.setProperty('--theme-card-radius', `${updates.card_radius}px`);
    if (updates.card_bg_color) root.style.setProperty('--theme-card-bg', updates.card_bg_color);
    if (updates.card_border_color) root.style.setProperty('--theme-card-border', updates.card_border_color);
    if (updates.search_bg_color) root.style.setProperty('--theme-search-bg', updates.search_bg_color);
    if (updates.search_text_color) root.style.setProperty('--theme-search-text', updates.search_text_color);
    if (updates.account_bg_color) root.style.setProperty('--theme-account-bg', updates.account_bg_color);
    if (updates.account_text_color) root.style.setProperty('--theme-account-text', updates.account_text_color);

    setIsSaving(true);
    setLastMessage('');

    try {
      startTransition(async () => {
        await saveTheme(newTheme);
        setIsSaving(false);
        setLastMessage('✅ Theme tersimpan!');
        setTimeout(() => setLastMessage(''), 2000);
      });
    } catch {
      setTheme(previousTheme);
      setIsSaving(false);
      setLastMessage('❌ Gagal menyimpan theme');
      setTimeout(() => setLastMessage(''), 3000);
    }
  }, [theme]);

  return (
    <EditModeContext.Provider value={{ isEditMode, isAdmin, toggleEditMode, copy, theme, updateCopy, updateTheme, isSaving, lastMessage }}>
      {children}
    </EditModeContext.Provider>
  );
}
