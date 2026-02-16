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

  // Non-edit mode: render plain text
  if (!isEditMode) {
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  // Edit mode, currently editing
  if (isEditing) {
    return (
      <span className="relative inline-block" style={style}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${className} bg-white ring-2 ring-blue-500 rounded px-1 py-0.5 outline-none min-w-[100px] resize-none editor-control`}
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
            className={`${className} bg-white text-slate-900 ring-2 ring-blue-500 rounded px-1 py-0.5 outline-none min-w-[60px] editor-control`}
            style={{ width: `${Math.max(editValue.length * 8, 60)}px` }}
          />
        )}
      </span>
    );
  }

  // Edit mode, not editing: hoverable
  return (
    <Tag
      className={`${className} cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 hover:rounded editor-control`}
      style={style}
      onClick={handleStartEdit}
      title={`Klik untuk edit "${copyKey}"`}
    >
      {value}
    </Tag>
  );
}
