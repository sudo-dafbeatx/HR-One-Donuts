'use client';

import { createContext, useContext, useState, useCallback, useTransition, ReactNode, useEffect, useRef } from 'react';
import { UITheme } from '@/types/cms';
import { DEFAULT_THEME, DEFAULT_COPY } from '@/lib/theme-defaults';
import { saveTheme, saveUICopy } from '@/app/admin/actions';
import { createClient } from '@/lib/supabase/client';

interface EditModeContextType {
  isEditMode: boolean;
  isAdmin: boolean;
  toggleEditMode: () => void;
  copy: Record<string, string>;
  theme: UITheme;
  updateCopy: (key: string, value: string) => Promise<void>;
  updateTheme: (updates: Partial<UITheme>) => Promise<void>;
  updateProduct: (id: string, updates: { name?: string; price?: number }) => Promise<void>;
  isSaving: boolean;
  lastMessage: string;
  setPanelOpen: (isOpen: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  isAdmin: false,
  toggleEditMode: () => {},
  copy: DEFAULT_COPY,
  theme: DEFAULT_THEME,
  updateCopy: async () => {},
  updateTheme: async () => {},
  updateProduct: async () => {},
  isSaving: false,
  lastMessage: '',
  setPanelOpen: () => {},
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

export function EditModeProvider({ children, initialCopy, initialTheme, isAdmin: initialIsAdmin }: EditModeProviderProps) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copy, setCopy] = useState<Record<string, string>>(() => ({ ...DEFAULT_COPY, ...initialCopy }));
  const [theme, setTheme] = useState<UITheme>(() => ({ ...DEFAULT_THEME, ...initialTheme }));
  const [isSaving, setIsSaving] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [, startTransition] = useTransition();
  const supabase = createClient();
  const editModeRef = useRef(false);

  // Client-side admin verification
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, [supabase]);

  // JavaScript-based click interceptor — blocks ALL clicks on non-editor elements
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!editModeRef.current) return;

      const target = e.target as HTMLElement;
      // Allow clicks on elements with .editor-control or inside .editor-control
      if (target.closest('.editor-control')) return;
      // Allow clicks inside the theme panel
      if (target.closest('[data-editor-panel]')) return;

      // Block everything else
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Use capture phase to intercept before any React handler fires
    document.addEventListener('click', handler, true);
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('pointerdown', handler, true);

    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('pointerdown', handler, true);
    };
  }, []);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode(prev => {
      const next = !prev;
      editModeRef.current = next;
      if (next) {
        document.body.classList.add('edit-mode-active');
      } else {
        document.body.classList.remove('edit-mode-active', 'edit-mode-panel-open');
      }
      return next;
    });
    setLastMessage('');
  }, [isAdmin]);

  const setPanelOpen = useCallback((isOpen: boolean) => {
    if (isOpen) {
      document.body.classList.add('edit-mode-panel-open');
    } else {
      document.body.classList.remove('edit-mode-panel-open');
    }
  }, []);

  const updateCopy = useCallback(async (key: string, value: string) => {
    const previousValue = copy[key];
    setCopy(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);
    setLastMessage('');

    try {
      startTransition(async () => {
        await saveUICopy(key, value);
        setIsSaving(false);
        setLastMessage('Tersimpan');
        setTimeout(() => setLastMessage(''), 2000);
      });
    } catch {
      setCopy(prev => ({ ...prev, [key]: previousValue }));
      setIsSaving(false);
      setLastMessage('Gagal menyimpan');
      setTimeout(() => setLastMessage(''), 3000);
    }
  }, [copy]);

  const updateTheme = useCallback(async (updates: Partial<UITheme>) => {
    const previousTheme = { ...theme };
    const newTheme = { ...theme, ...updates };

    setTheme(newTheme);

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
        setLastMessage('Theme tersimpan');
        setTimeout(() => setLastMessage(''), 2000);
      });
    } catch {
      setTheme(previousTheme);
      setIsSaving(false);
      setLastMessage('Gagal menyimpan theme');
      setTimeout(() => setLastMessage(''), 3000);
    }
  }, [theme]);

  const updateProduct = useCallback(async (id: string, updates: { name?: string; price?: number }) => {
    setIsSaving(true);
    setLastMessage('');
    try {
      startTransition(async () => {
        const { saveProduct } = await import('@/app/admin/actions');
        await saveProduct({ id, ...updates } as Parameters<typeof saveProduct>[0]);
        setIsSaving(false);
        setLastMessage('Produk diperbarui');
        setTimeout(() => setLastMessage(''), 2000);
      });
    } catch {
      setIsSaving(false);
      setLastMessage('Gagal update produk');
      setTimeout(() => setLastMessage(''), 3000);
    }
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditMode, isAdmin, toggleEditMode, copy, theme, updateCopy, updateTheme, updateProduct, isSaving, lastMessage, setPanelOpen }}>
      {children}
    </EditModeContext.Provider>
  );
}
