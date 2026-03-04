"use client";

import { useState, useEffect } from "react";
import { playNotificationSound } from "@/lib/audio-utils";

export default function AudioPermissionToast() {
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if we've already asked the user for audio permission
    const hasAsked = localStorage.getItem("audioAllowed");
    if (hasAsked === null) {
      // Small delay to ensure smooth rendering after mount
      const timer = setTimeout(() => setShowToast(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const handleAllowClick = () => {
    localStorage.setItem("audioAllowed", "true");
    
    // Immediately play the sound to unlock the AudioContext on this specific user gesture
    playNotificationSound("/sounds/selamat-datang-full.mp3");
    
    // We also set the session storage flag so it doesn't play twice on this very first visit
    sessionStorage.setItem("welcomeSoundPlayed", "true");
    
    setShowToast(false);
  };

  const handleDismissClick = () => {
    // We record that they declined for now. We can prompt again in the future if we want by clearing this.
    localStorage.setItem("audioAllowed", "false");
    setShowToast(false);
  };

  if (!mounted || !showToast) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl border border-primary/20 p-4 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">volume_up</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800">Izinkan Suara Notifikasi?</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Situs ini menggunakan suara untuk menyambut Anda dan memberikan notifikasi pesanan.
          </p>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button
              onClick={handleDismissClick}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Lain Kali
            </button>
            <button
              onClick={handleAllowClick}
              className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              Izinkan Suara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
