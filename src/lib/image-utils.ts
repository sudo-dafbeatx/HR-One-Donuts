const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Allow large files for client-side compression)
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
      error: `Ukuran file terlalu besar (${sizeMB}MB). Maksimal 50MB.` 
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

export function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  // Format: https://[ID].supabase.co/storage/v1/object/public/images/[path]
  const parts = url.split('/public/images/');
  if (parts.length < 2) return null;
  return parts[1];
}
