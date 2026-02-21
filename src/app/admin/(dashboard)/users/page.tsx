import { createServiceRoleClient } from '@/lib/supabase/server';
import AdminUsersClient from '@/components/admin/AdminUsersClient';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default async function UsersAdminPage() {
  const supabase = createServiceRoleClient();
  
  let usersList = [];
  let fetchError = null;

  try {
    // Call our new RPC function to get all users
    const { data: usersData, error } = await supabase.rpc('get_admin_users_list');
    
    if (error) {
      throw new Error(error.message);
    }

    if (typeof usersData === 'string') {
      usersList = JSON.parse(usersData);
    } else if (Array.isArray(usersData)) {
      usersList = usersData;
    }
  } catch (e) {
    console.error("Failed to fetch/parse users data", e);
    fetchError = e;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Manajemen Pengguna</h1>
        <p className="text-slate-500">Kelola hak akses dan lihat daftar pengguna yang terdaftar di sistem.</p>
      </div>

      {fetchError ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-200">
           <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
           <div>
             <p className="font-semibold">Gagal memuat data pengguna</p>
             <p className="text-sm">Apakah Anda sudah menjalankan file SQL Migration `20260221_add_user_id_to_admin_users.sql`?</p>
             <p className="text-xs text-red-600 mt-1">{(fetchError as Error).message}</p>
           </div>
        </div>
      ) : (
        <AdminUsersClient initialUsers={usersList || []} />
      )}
    </div>
  );
}
