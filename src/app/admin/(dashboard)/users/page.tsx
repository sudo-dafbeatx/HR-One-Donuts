import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminUsersClient from '@/components/admin/AdminUsersClient';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default async function UsersAdminPage() {
  const supabase = await createServerSupabaseClient();
  
  // Call our new RPC function to get all users
  const { data: usersData, error } = await supabase.rpc('get_admin_users_list');
  
  let usersList = [];
  try {
    if (typeof usersData === 'string') {
      usersList = JSON.parse(usersData);
    } else if (Array.isArray(usersData)) {
      usersList = usersData;
    }
  } catch (e) {
    console.error("Failed to parse users data", e);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Manajemen Pengguna</h1>
        <p className="text-slate-500">Kelola hak akses dan lihat daftar pengguna yang terdaftar di sistem.</p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-200">
           <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
           <div>
             <p className="font-semibold">Gagal memuat data pengguna</p>
             <p className="text-sm">Apakah Anda sudah menjalankan file SQL Migration `20260220_admin_users_management.sql`?</p>
             <p className="text-xs text-red-600 mt-1">{error.message}</p>
           </div>
        </div>
      ) : (
        <AdminUsersClient initialUsers={usersList || []} />
      )}
    </div>
  );
}
