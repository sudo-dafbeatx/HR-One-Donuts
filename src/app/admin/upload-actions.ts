'use server';

import sharp from 'sharp';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateImageName } from '@/lib/image-utils';

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 85;

export async function uploadImage(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized: Anda harus login sebagai admin');
  }
  
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }
  
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    
    // Generate unique filename
    const fileName = generateImageName(file.name);
    const filePath = `products/${fileName}`; // Organize by folder
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600', // 1 hour cache
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Gagal upload gambar');
  }
}

export async function deleteImage(filePath: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath]);
  
  if (error) throw error;
  
  return { success: true };
}
