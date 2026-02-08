'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadImage } from '@/app/admin/upload-actions';
import { validateImageFile } from '@/lib/image-utils';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUploaded: (url: string, path: string) => void;
  label?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export default function ImageUploader({ 
  currentImage, 
  onImageUploaded,
  label = 'Upload Gambar',
  aspectRatio = 'video'
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadImage(formData);
      onImageUploaded(result.url, result.path);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: 'aspect-auto min-h-48'
  }[aspectRatio];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {preview ? (
          <div className={`relative ${aspectClass} group`}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <ArrowUpTrayIcon className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Klik untuk ganti gambar</p>
              </div>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-white text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`${aspectClass} flex flex-col items-center justify-center gap-2 py-10`}>
            <PhotoIcon className="w-12 h-12 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              Drag & drop atau klik untuk upload
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP, HEIC (Max 5MB)</p>
            <p className="text-xs text-slate-500">Auto-convert ke WebP</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
      </div>
      
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {isUploading && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">
            ⚙️ Converting ke WebP format...
          </p>
        </div>
      )}
    </div>
  );
}
