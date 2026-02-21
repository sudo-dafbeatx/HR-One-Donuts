import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/admin-auth';

// Add Node.js runtime to explicitly access native cryptography/bcrypt
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 1. Validate session
    const { supabase, adminId } = await getAdminSession();

    // 2. Parse request body
    const { currentPassword, newUsername, newPassword } = await req.json();

    if (!currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        { error: 'Password saat ini, username baru, dan password baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const trimmedUsername = newUsername.trim().toLowerCase();

    // 3. Get current admin credentials to verify password
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('username, password_hash')
      .eq('id', adminId)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin tidak ditemukan.' },
        { status: 500 }
      );
    }

    // 4. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, adminData.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini salah.' },
        { status: 401 }
      );
    }

    // 5. Check if new username is taken (if it's changing)
    if (trimmedUsername !== adminData.username) {
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', trimmedUsername)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username sudah digunakan oleh admin lain.' },
          { status: 409 }
        );
      }
    }

    // 6. Hash new password and update
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        username: trimmedUsername,
        password_hash: newPasswordHash
      })
      .eq('id', adminId);

    if (updateError) {
      console.error('[UpdateCredentials] DB Detail:', updateError);
      return NextResponse.json(
        { error: 'Gagal memperbarui data. Coba lagi.' },
        { status: 500 }
      );
    }

    // 7. Log action
    await supabase.from('admin_activity_log').insert({
      admin_id: adminId,
      action: 'update_credentials',
      target_type: 'self',
      target_id: adminId,
      details: { username_changed: trimmedUsername !== adminData.username }
    });

    return NextResponse.json({ success: true, message: 'Kredensial berhasil diperbarui.' });

  } catch (error: any) {
    console.error('[UpdateCredentials] Error:', error);
    
    // Check if it's our session error
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Sesi tidak valid. Silakan login kembali.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
