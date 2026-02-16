'use client';

import React from 'react';
import { useEditMode } from '@/context/EditModeContext';

interface EditableProductFieldProps {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  type?: 'text' | 'number';
  prefix?: string;
  productId: string; // Keep for context or future use
}

export default function EditableProductField({ 
  value, 
  onSave, 
  className = '', 
  type = 'text',
  prefix = ''
}: EditableProductFieldProps) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value && editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  if (!isEditMode) {
    return (
      <div className={className}>
        {prefix}{type === 'number' ? Number(value).toLocaleString('id-ID') : value}
      </div>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className={`${className} bg-white/95 backdrop-blur-sm text-slate-900 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40 rounded-lg px-2 outline-none w-full editor-control`}
      />
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditValue(value);
        setIsEditing(true);
      }}
      className={`${className} cursor-pointer transition-all duration-200 editor-control`}
      style={{
        outline: '1.5px dashed rgba(59, 130, 246, 0.35)',
        outlineOffset: '2px',
        borderRadius: '4px',
      }}
    >
      {prefix}{type === 'number' ? Number(value).toLocaleString('id-ID') : value}
    </div>
  );
}
