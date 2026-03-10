'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateImageName } from '@/lib/image-utils';
import { processImage, fileToBuffer } from '@/lib/image-processing';

export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized: Silakan login ulang.');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('File tidak ditemukan.');
  }

  try {
    const buffer = await fileToBuffer(file);
    const { buffer: processed } = await processImage(buffer, 'avatar');

    const fileName = generateImageName(file.name);
    const filePath = `avatars/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, processed, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      throw new Error('Gagal mendapatkan URL gambar');
    }

    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error
      ? error.message
      : 'Gagal mengoptimalkan gambar. Pastikan file adalah gambar yang valid.';
    throw new Error(message);
  }
}

export async function setPredefinedAvatar(url: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);

  await supabase
    .from('user_profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);

  return { success: true };
}
