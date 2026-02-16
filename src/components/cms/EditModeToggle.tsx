'use client';

import { useEditMode } from '@/context/EditModeContext';

export default function EditModeToggle() {
  const { isAdmin, isEditMode, toggleEditMode, isSaving, lastMessage } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[200] flex flex-col items-end gap-2">
      {/* Status Message */}
      {lastMessage && (
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-fade-in ${
          lastMessage.startsWith('✅') 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {lastMessage}
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 text-white shadow-lg animate-pulse">
          Menyimpan...
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleEditMode}
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl transition-all duration-300 ${
          isEditMode
            ? 'bg-blue-600 text-white ring-4 ring-blue-300/50 hover:bg-blue-700 scale-105'
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-xl'
        }`}
      >
        <span className="material-symbols-outlined text-xl">
          {isEditMode ? 'check_circle' : 'edit'}
        </span>
        {isEditMode ? 'Selesai Edit' : 'Mode Edit'}
      </button>
    </div>
  );
}
