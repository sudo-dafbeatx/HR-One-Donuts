'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { uploadImage } from '@/app/admin/upload-actions';
import { validateImageFile } from '@/lib/image-utils';
import LoadingSpinner from '../ui/LoadingSpinner';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            'image/webp',
            0.7 // quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

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
    setIsSuccess(false);
    setError(null);
    
    try {
      console.log(`📦 [Uploader] Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Client-side compression
      const compressedBlob = await compressImage(file);
      console.log(`✨ [Uploader] Compressed size: ${(compressedBlob.size / 1024 / 1024).toFixed(2)} MB`);
      
      const formData = new FormData();
      // We convert blob back to file so it has a name
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
        type: 'image/webp'
      });
      formData.append('file', compressedFile);
      
      const result = await uploadImage(formData);
      onImageUploaded(result.url, result.path);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload gagal.';
      setError(errorMsg);
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
          <div className={`relative ${aspectClass} group uppercase`}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <ArrowUpTrayIcon className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-[10px] font-black tracking-widest uppercase">Ganti Gambar</p>
              </div>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <LoadingSpinner color="border-white" />
              </div>
            )}
            {isSuccess && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center animate-scale-in">
                <div className="bg-white p-3 rounded-full shadow-2xl">
                  <CheckCircleIcon className="w-8 h-8 text-primary" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`${aspectClass} flex flex-col items-center justify-center gap-2 py-10`}>
            {isUploading ? (
              <LoadingSpinner />
            ) : (
              <>
                <PhotoIcon className="w-12 h-12 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Upload Gambar
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">JPG, PNG, WEBP, HEIC</p>
              </>
            )}
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
      
      {error && !isUploading && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 animate-scale-in">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{error}</p>
        </div>
      )}
    </div>
  );
}
