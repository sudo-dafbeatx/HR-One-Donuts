const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (match Supabase bucket limit)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC.' 
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `Ukuran file terlalu besar (${sizeMB}MB). Maksimal 2MB.` 
    };
  }
  
  return { valid: true };
}

export function generateImageName(_originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID().slice(0, 8);
  const ext = 'webp'; // Always WebP output
  return `${timestamp}-${random}.${ext}`;
}
