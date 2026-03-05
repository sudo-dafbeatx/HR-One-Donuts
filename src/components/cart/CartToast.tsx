'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

interface ToastMessage {
  id: number;
  itemName: string;
}

let toastId = 0;
let addToastExternal: ((itemName: string) => void) | null = null;

/**
 * Call this function from anywhere to show a "Ditambahkan ke keranjang" toast.
 */
export function showCartToast(itemName: string) {
  addToastExternal?.(itemName);
}

export default function CartToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((itemName: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, itemName }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-9998 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="size-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="size-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Ditambahkan ke Keranjang
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {toast.itemName}
            </p>
          </div>
          <ShoppingCartIcon className="size-5 text-primary shrink-0" />
        </div>
      ))}
    </div>
  );
}
