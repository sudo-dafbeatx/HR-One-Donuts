'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', native: 'ID' },
  { code: 'en', name: 'English', native: 'EN' },
  { code: 'su', name: 'Basa Sunda', native: 'SU' },
  { code: 'jv', name: 'Basa Jawa', native: 'JV' },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage, isLoaded } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded) return null;

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 hover:border-primary/30 hover:shadow-sm transition-all bg-white/50 backdrop-blur-sm group"
      >
        <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-widest">
          {currentLang.native}
        </span>
        <ChevronDownIcon className={`size-3 text-slate-400 group-hover:text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-60">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                language === lang.code 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="size-1.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
