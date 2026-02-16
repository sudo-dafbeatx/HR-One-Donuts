'use server';

import sharp from 'sharp';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateImageName } from '@/lib/image-utils';

const MAX_WIDTH = 1000;
const WEBP_QUALITY = 75;

export async function uploadImage(formData: FormData) {
  console.log('🚀 [uploadImage] Starting upload process...');
  
  const supabase = await createServerSupabaseClient();
  
  // Check authentication & role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') {
    if (profileError) console.error(' [uploadImage] Profile error:', profileError);
    throw new Error('Forbidden: Akses ditolak. Hanya admin yang boleh upload gambar.');
  }
  
  const file = formData.get('file') as File;
  if (!file) {
    console.error('❌ [uploadImage] No file in FormData');
    throw new Error('No file provided');
  }
  
  console.log('📁 [uploadImage] File info:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(2)} KB`
  });
  
  try {
    // Convert file to buffer
    console.log('🔄 [uploadImage] Converting to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ [uploadImage] Buffer created:', buffer.length, 'bytes');
    
    // Process image with sharp
    console.log('🖼️  [uploadImage] Processing with sharp...');
    const processedImage = await sharp(buffer)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    
    console.log('✅ [uploadImage] Sharp processing complete:', processedImage.length, 'bytes');
    
    // Generate unique filename
    const fileName = generateImageName(file.name);
    const filePath = `products/${fileName}`;
    console.log('📝 [uploadImage] Generated path:', filePath);
    
    // Upload to Supabase Storage
    console.log('☁️  [uploadImage] Uploading to Supabase Storage...');
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('❌ [uploadImage] Supabase upload error:', error);
      throw error;
    }
    
    console.log('✅ [uploadImage] Upload successful');
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    console.log('🔗 [uploadImage] Public URL:', publicUrl);
    
    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error: unknown) {
    console.error('💥 [uploadImage] Error details:', error);
    
    // Better error messages
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "images" belum dibuat. Silakan buat bucket di Supabase Dashboard terlebih dahulu.');
      }
      if (error.message.includes('new row violates row-level security')) {
        throw new Error('Akses ditolak. Pastikan RLS policies sudah di-set dengan benar.');
      }
      throw new Error(error.message);
    }
    
    throw new Error('Gagal upload gambar. Cek console untuk detail error.');
  }
}

export async function deleteImage(filePath: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') {
    if (profileError) console.error(' [deleteImage] Profile error:', profileError);
    throw new Error('Forbidden');
  }
  
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath]);
  
  if (error) throw error;
  
  return { success: true };
}
