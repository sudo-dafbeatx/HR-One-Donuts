'use server';

import sharp from 'sharp';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateImageName } from '@/lib/image-utils';

const AVATAR_SIZE = 256;
const WEBP_QUALITY = 80;

export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process avatar with sharp
    const processedImage = await sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: 'cover',
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    
    const fileName = generateImageName(file.name);
    const filePath = `avatars/${user.id}/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    
    if (updateError) throw updateError;
    
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: unknown) {
    console.error('Avatar upload error:', error);
    const message = error instanceof Error ? error.message : 'Gagal upload avatar';
    throw new Error(message);
  }
}

export async function setPredefinedAvatar(url: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);
    
  if (error) throw error;
  return { success: true };
}
