'use client';

import { useEditMode } from '@/context/EditModeContext';
import { useState, useRef, useEffect } from 'react';

export default function EditModeToggle() {
  const { isAdmin, isEditMode, toggleEditMode, isSaving, lastMessage } = useEditMode();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('editFabPosition');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Make sure it's valid
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setTimeout(() => setPosition(parsed), 0);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (!isAdmin) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    hasMovedRef.current = false;
    
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    // Allow slight movement before considering it a drag for click tolerance
    if (Math.abs(e.clientX - position.x - offsetRef.current.x) > 3 || Math.abs(e.clientY - position.y - offsetRef.current.y) > 3) {
      hasMovedRef.current = true;
    }
    
    let newX = e.clientX - offsetRef.current.x;
    let newY = e.clientY - offsetRef.current.y;
    
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      const left0 = window.innerWidth - 20 - rect.width;
      const top0 = window.innerHeight - 20 - rect.height;
      
      // Clamp values so it doesn't go off-screen
      newX = Math.max(-left0, Math.min(20, newX));
      newY = Math.max(-top0, Math.min(20, newY));
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    
    // Check bounds one more time based on the active viewport to ensure snap-to-screen
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      const left0 = window.innerWidth - 20 - rect.width;
      const top0 = window.innerHeight - 20 - rect.height;
      const finalX = Math.max(-left0, Math.min(20, position.x));
      const finalY = Math.max(-top0, Math.min(20, position.y));
      
      const newPos = { x: finalX, y: finalY };
      setPosition(newPos);
      localStorage.setItem('editFabPosition', JSON.stringify(newPos));
    } else {
      localStorage.setItem('editFabPosition', JSON.stringify(position));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    toggleEditMode();
  };

  return (
    <div 
      ref={dragRef}
      className={`fixed bottom-[20px] right-[20px] z-[9999] flex flex-col items-end gap-2.5 editor-control touch-none transition-transform ${isDragging ? 'duration-0' : 'duration-300 ease-out'}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      {/* Status toast */}
      {(lastMessage || isSaving) && (
        <div className={`
          px-4 py-2 rounded-xl text-[13px] font-semibold tracking-tight
          backdrop-blur-xl border shadow-lg
          transition-all duration-300 animate-fade-in pointer-events-none
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        className={`
          group flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-[14px]
          text-[13px] font-semibold tracking-tight
          shadow-xl transition-all active:scale-[0.97]
          backdrop-blur-xl border select-none
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${isEditMode 
            ? 'bg-slate-900/95 text-white border-slate-700 hover:bg-slate-800/95 shadow-slate-900/40' 
            : 'bg-white/95 text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-2xl shadow-slate-200/60'
          }
        `}
      >
        <span className={`
          size-8 rounded-[10px] flex items-center justify-center text-lg
          transition-all duration-300 pointer-events-none
          ${isEditMode 
            ? 'bg-white/15' 
            : 'bg-primary/10 text-primary'
          }
        `}>
          <span className="material-symbols-outlined text-[18px]">
            {isEditMode ? 'close' : 'edit_square'}
          </span>
        </span>
        <span className="pointer-events-none">{isEditMode ? 'Selesai' : 'Edit'}</span>
      </button>
    </div>
  );
}
