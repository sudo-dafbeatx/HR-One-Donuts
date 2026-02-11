"use client";

import React from 'react';

export type FilterValue = {
  type: 'sale_type' | 'package_type' | 'all';
  value: string | null;
};

interface CategoryFilterProps {
  currentFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

export default function CategoryFilter({ currentFilter, onFilterChange }: CategoryFilterProps) {
  const filters: { label: string; filter: FilterValue }[] = [
    { label: 'Semua', filter: { type: 'all', value: null } },
    { label: 'Flash Sale', filter: { type: 'sale_type', value: 'flash_sale' } },
    { label: 'Jumat Berkah', filter: { type: 'sale_type', value: 'jumat_berkah' } },
    { label: 'Takjil', filter: { type: 'sale_type', value: 'takjil' } },
    { label: 'Satuan', filter: { type: 'package_type', value: 'satuan' } },
    { label: 'Box', filter: { type: 'package_type', value: 'box' } },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 mb-2">
      {filters.map((f) => {
        const isActive = currentFilter.type === f.filter.type && currentFilter.value === f.filter.value;
        
        return (
          <button
            key={f.label}
            onClick={() => onFilterChange(f.filter)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-black transition-all border-2 ${
              isActive 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
