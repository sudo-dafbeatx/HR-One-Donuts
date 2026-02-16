'use client';

import { useEditMode } from '@/context/EditModeContext';

export default function EditModeToggle() {
  const { isAdmin, isEditMode, toggleEditMode, isSaving, lastMessage } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2.5 editor-control">
      {/* Status toast */}
      {(lastMessage || isSaving) && (
        <div className={`
          px-4 py-2 rounded-xl text-[13px] font-semibold tracking-tight
          backdrop-blur-xl border shadow-lg
          transition-all duration-300 animate-fade-in
          ${isSaving 
            ? 'bg-slate-900/90 text-white border-slate-700' 
            : lastMessage.includes('Gagal')
              ? 'bg-red-950/90 text-red-200 border-red-800/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/50'
          }
        `}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : lastMessage}
        </div>
      )}

      {/* Main Toggle */}
      <button
        onClick={toggleEditMode}
        className={`
          group flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-[14px]
          text-[13px] font-semibold tracking-tight
          shadow-xl transition-all duration-300 active:scale-[0.97]
          backdrop-blur-xl border
          ${isEditMode 
            ? 'bg-slate-900/95 text-white border-slate-700 hover:bg-slate-800/95 shadow-slate-900/40' 
            : 'bg-white/95 text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-2xl shadow-slate-200/60'
          }
        `}
      >
        <span className={`
          size-8 rounded-[10px] flex items-center justify-center text-lg
          transition-all duration-300
          ${isEditMode 
            ? 'bg-white/15' 
            : 'bg-primary/10 text-primary'
          }
        `}>
          <span className="material-symbols-outlined text-[18px]">
            {isEditMode ? 'close' : 'edit_square'}
          </span>
        </span>
        {isEditMode ? 'Selesai' : 'Edit'}
      </button>
    </div>
  );
}
