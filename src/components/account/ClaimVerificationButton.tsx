"use client";

import { useState } from "react";
import { claimVerification } from "@/app/actions/profile-actions";
import { useLoading } from "@/context/LoadingContext";
import { useErrorPopup } from "@/context/ErrorPopupContext";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface ClaimVerificationButtonProps {
  onSuccess?: () => void;
}

export default function ClaimVerificationButton({ onSuccess }: ClaimVerificationButtonProps) {
  const [isDone, setIsDone] = useState(false);
  const { setIsLoading } = useLoading();
  const { showError } = useErrorPopup();
  const router = useRouter();

  const handleClaim = async () => {
    setIsLoading(true, "Memproses verifikasi...");
    try {
      const result = await claimVerification();
      if (result.success) {
        setIsDone(true);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        showError("Gagal", result.error || "Gagal melakukan verifikasi.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      showError("Error", error.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="w-full bg-emerald-50 text-emerald-600 rounded-2xl p-4 border border-emerald-100 flex items-center justify-center gap-2 animate-in zoom-in duration-300">
        <CheckBadgeIcon className="size-5" />
        <span className="text-sm font-black uppercase tracking-wider">Terverifikasi</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClaim}
      className="w-full bg-[#1a1a1a] text-white h-12 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
    >
      <CheckBadgeIcon className="size-5 text-blue-400 group-hover:scale-110 transition-transform" />
      Claim Verifikasi
    </button>
  );
}
