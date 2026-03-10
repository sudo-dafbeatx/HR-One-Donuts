'use server';

import { getAdminSession } from '@/lib/admin-auth';
import { generateImageName } from '@/lib/image-utils';
import { processImage, fileToBuffer } from '@/lib/image-processing';

export async function uploadImage(formData: FormData) {
  const { supabase } = await getAdminSession();

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const buffer = await fileToBuffer(file);
    const { buffer: processed } = await processImage(buffer, 'product');

    const fileName = generateImageName(file.name);
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, processed, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found')) {
        return { success: false, error: 'Storage bucket "images" belum dibuat. Silakan buat bucket di Supabase Dashboard terlebih dahulu.' };
      }
      if (error.message.includes('new row violates row-level security')) {
        return { success: false, error: 'Akses ditolak. Pastikan RLS policies sudah di-set dengan benar.' };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Gagal mengoptimalkan gambar. Pastikan file adalah gambar yang valid.' };
  }
}

export async function deleteImage(filePath: string) {
  const { supabase } = await getAdminSession();

  const { error } = await supabase.storage
    .from('images')
    .remove([filePath]);

  if (error) throw error;

  return { success: true };
}
