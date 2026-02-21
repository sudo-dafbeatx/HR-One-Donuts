import { getAdminSession } from '@/lib/admin-auth';
import AdminSettingsClient from '@/components/admin/settings/AdminSettingsClient';

export default async function AdminSettingsPage() {
  const { username } = await getAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ubah username dan password untuk akses panel administrasi.
        </p>
      </div>

      <AdminSettingsClient currentUsername={username} />
    </div>
  );
}
