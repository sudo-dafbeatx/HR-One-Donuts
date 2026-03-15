import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ProfileMissingFields, { MissingField } from "./ProfileMissingFields";

interface ProfileCompletionBarProps {
  completion: number;
  missingFields: MissingField[];
}

export default function ProfileCompletionBar({ completion, missingFields }: ProfileCompletionBarProps) {
  // Cap completion between 0 and 100
  const percentage = Math.min(100, Math.max(0, completion));
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Lengkapi Profil Anda</h3>
          <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
            {percentage < 100 
              ? "Dapatkan lencana verifikasi dengan melengkapi profil."
              : "Profil lengkap! Akun Anda siap diverifikasi."}
          </p>
        </div>
        <span className="text-xl font-black text-primary shrink-0">{percentage}%</span>
      </div>

      {/* Clickable Progress Bar Wrapper */}
      <Link href="/settings/account/edit" className="block group relative">
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-50 shadow-inner">
          <div 
            className="h-full bg-linear-to-r from-primary via-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </div>
        </div>
        
        {/* Mobile hover indicator */}
        <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full border-2 border-white scale-0 group-hover:scale-100 transition-transform md:hidden" />
      </Link>

      {/* Link and Missing Fields */}
      {percentage < 100 && (
        <div className="space-y-6">
          <Link 
            href="/settings/account/edit"
            className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-widest hover:gap-2 transition-all group/link"
          >
            Lengkapi profil sekarang
            <ChevronRightIcon className="size-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>

          <ProfileMissingFields fields={missingFields} />
        </div>
      )}
    </div>
  );
}
