'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

import id from '../translations/dictionaries/id.json';
import en from '../translations/dictionaries/en.json';
import su from '../translations/dictionaries/su.json';
import jv from '../translations/dictionaries/jv.json';

export type Language = 'id' | 'en' | 'su' | 'jv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Language, Record<string, unknown>> = {
  id,
  en,
  su,
  jv,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [isLoaded, setIsLoaded] = useState(false);
  const [supabase] = useState(() => createClient());

  // Initialize language
  useEffect(() => {
    async function initLanguage() {
      // 1. Check LocalStorage
      const savedLang = localStorage.getItem('user-language') as Language;
      
      // 2. Check User Profile if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('language')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.language) {
          setLanguageState(profile.language as Language);
          localStorage.setItem('user-language', profile.language);
          setIsLoaded(true);
          return;
        }
      }

      if (savedLang && ['id', 'en', 'su', 'jv'].includes(savedLang)) {
        setLanguageState(savedLang);
      }
      setIsLoaded(true);
    }

    initLanguage();
  }, [supabase]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('user-language', lang);

    // Sync to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ language: lang })
        .eq('id', user.id);
      
      // Also update legacy profile if it exists
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', user.id);
    }
  };

type DictionaryValue = string | DictionaryObject;
interface DictionaryObject { [key: string]: DictionaryValue; }

  const t = useCallback((keyPath: string, variables?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries.id;
    const keys = keyPath.split('.');
    
    let result: DictionaryValue = dict as unknown as DictionaryObject;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as DictionaryObject)[key];
      } else {
        // Fallback to id dictionary if key not found in current language
        let fallback: DictionaryValue = dictionaries.id as unknown as DictionaryObject;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = (fallback as DictionaryObject)[fKey];
          } else {
            return keyPath; // Return raw key as absolute fallback
          }
        }
        result = fallback;
        break;
      }
    }
    
    let str = typeof result === 'string' ? result : keyPath;
    
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        str = str.replace(`{${key}}`, String(value));
      });
    }
    
    return str;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
