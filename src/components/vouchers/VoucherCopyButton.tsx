'use client';

import React, { useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function VoucherCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
        copied 
        ? 'bg-emerald-100 text-emerald-700' 
        : 'bg-white text-slate-600 hover:bg-[#1b00ff] hover:text-white border border-slate-200 hover:border-transparent'
      }`}
    >
      {copied ? (
        <>Disalin!</>
      ) : (
        <>
          <DocumentDuplicateIcon className="w-4 h-4" />
          Salin
        </>
      )}
    </button>
  );
}
