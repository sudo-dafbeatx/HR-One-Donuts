'use client';

import { useEditMode } from '@/context/EditModeContext';

export default function EditModeToggle() {
  const { isAdmin, isEditMode, toggleEditMode, isSaving, lastMessage } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2">
      {/* Status Message */}
      {lastMessage && (
        <div className={`px-4 py-2 rounded-2xl text-xs font-black shadow-2xl animate-fade-in ${
          lastMessage.startsWith('✅') 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {lastMessage}
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="px-4 py-2 rounded-2xl text-xs font-black bg-blue-600 text-white shadow-2xl animate-pulse">
          Menyimpan...
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleEditMode}
        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold shadow-2xl transition-all active:scale-95 editor-control ${
          isEditMode 
            ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-100' 
            : 'bg-primary text-white hover:opacity-90 ring-4 ring-primary/20'
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
