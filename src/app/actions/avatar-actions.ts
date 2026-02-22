'use server';

import sharp from 'sharp';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateImageName } from '@/lib/image-utils';

const AVATAR_SIZE = 256;
const WEBP_QUALITY = 80;

export async function uploadAvatar(formData: FormData) {
  console.log('🚀 [uploadAvatar] Action started...');
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ [uploadAvatar] No user session found');
    throw new Error('Unauthorized: Silakan login ulang.');
  }

  const file = formData.get('file') as File;
  if (!file) {
    console.error('❌ [uploadAvatar] No file found in FormData');
    throw new Error('File tidak ditemukan.');
  }
  
  console.log(`📁 [uploadAvatar] File: ${file.name}, size: ${file.size}, type: ${file.type}`);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('🖼️ [uploadAvatar] Processing image with sharp...');
    // Process avatar with sharp
    const processedImage = await sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: 'cover',
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    
    const fileName = generateImageName(file.name);
    const filePath = `avatars/${user.id}/${fileName}`;
    
    console.log(`☁️ [uploadAvatar] Uploading to Supabase: ${filePath}`);
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) {
      console.error('❌ [uploadAvatar] Storage upload error:', uploadError);
      throw uploadError;
    }
    
    // getPublicUrl is synchronous and returns { data: { publicUrl: string } }
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    if (!data || !data.publicUrl) {
      throw new Error('Gagal mendapatkan URL gambar');
    }
    
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
    
    console.log(`🔗 [uploadAvatar] Public URL: ${publicUrl}`);
    
    // Update profiles table
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    
    // Update user_profiles table (Settings Suite sync)
    await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    
    console.log('✅ [uploadAvatar] Successfully updated profile avatar');
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: unknown) {
    console.error('💥 [uploadAvatar] Fatal Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal upload avatar';
    throw new Error(message);
  }
}

export async function setPredefinedAvatar(url: string) {
  console.log(`🎯 [setPredefinedAvatar] Setting avatar to: ${url}`);
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ [setPredefinedAvatar] No user session found');
    throw new Error('Unauthorized');
  }
  
  await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);
    
  // Sync to user_profiles
  await supabase
    .from('user_profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);
  
  console.log('✅ [setPredefinedAvatar] Avatar updated successfully');
  return { success: true };
}
