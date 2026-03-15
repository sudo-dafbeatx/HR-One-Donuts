"use client";

interface ProfileCompletionBarProps {
  completion: number;
}

export default function ProfileCompletionBar({ completion }: ProfileCompletionBarProps) {
  // Cap completion between 0 and 100
  const percentage = Math.min(100, Math.max(0, completion));
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Lengkapi Profil Anda</h3>
          <p className="text-[12px] text-slate-500 font-medium">
            {percentage < 100 
              ? "Lengkapi profil untuk mendapatkan verifikasi akun."
              : "Profil lengkap! Akun Anda siap diverifikasi."}
          </p>
        </div>
        <span className="text-lg font-black text-primary">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shrink-0">
        <div 
          className="h-full bg-linear-to-r from-primary to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
