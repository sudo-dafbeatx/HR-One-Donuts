'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditMode } from '@/context/EditModeContext';

interface EditableTextProps {
  copyKey: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export default function EditableText({ 
  copyKey, 
  as: Tag = 'span', 
  className = '', 
  style,
  multiline = false 
}: EditableTextProps) {
  const { isEditMode, copy, updateCopy } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const value = copy[copyKey] || copyKey;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditMode) return;
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue !== value && editValue.trim()) {
      updateCopy(copyKey, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  if (isEditing) {
    return (
      <span className="relative inline-block editor-control" style={style}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${className} bg-white/95 backdrop-blur-sm shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40 rounded-lg px-2 py-1 outline-none min-w-[100px] resize-none text-slate-900 editor-control`}
            rows={2}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${className} bg-white/95 backdrop-blur-sm shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40 rounded-lg px-2 py-1 outline-none min-w-[60px] text-slate-900 editor-control`}
            style={{ width: `${Math.max(editValue.length * 9, 80)}px` }}
          />
        )}
      </span>
    );
  }

  return (
    <Tag
      className={`${className} relative cursor-pointer transition-all duration-200 editor-control`}
      style={{
        ...style,
        outline: '1.5px dashed rgba(59, 130, 246, 0.35)',
        outlineOffset: '3px',
        borderRadius: '4px',
      }}
      onClick={handleStartEdit}
      title={`Edit: ${copyKey}`}
    >
      {value}
    </Tag>
  );
}
