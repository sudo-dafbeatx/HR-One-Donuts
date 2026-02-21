'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheckIcon, UserIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'user' | null;
  full_name: string | null;
  phone: string | null;
  is_active?: boolean;
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah hak akses pengguna ini menjadi ${newRole.toUpperCase()}?`)) return;
    
    setLoadingId(userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      if (data) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'user' } : u));
        setSuccessMsg("Hak akses pengguna berhasil diperbarui!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error).message || 'Gagal mengubah hak akses');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Yakin ingin ${currentStatus ? 'Menonaktifkan' : 'Mengaktifkan'} user ini?`)) return;
    setLoadingId(userId);
    setErrorMsg(null); setSuccessMsg(null);
    try {
      const { error } = await supabase.rpc('toggle_user_ban', { target_user_id: userId, ban_status: currentStatus });
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      setSuccessMsg(`Status berhasil diubah menjadi ${currentStatus ? 'Nonaktif' : 'Aktif'}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Gagal mengubah status blokir');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevokeSession = async (userId: string) => {
    if (!window.confirm('Yakin ingin memaksa sesi user ini logout (Revoke Token)?')) return;
    setLoadingId(userId);
    setErrorMsg(null); setSuccessMsg(null);
    try {
      // Call server-side API route — revocation is done entirely server-side
      // using the service role key. Frontend never touches JWT/tokens.
      const res = await fetch('/api/admin/force-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Gagal memaksa logout (HTTP ${res.status})`);
      }
      
      setSuccessMsg('Sesi user berhasil dicabut secara global dari server.');
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Gagal menarik sesi login');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  const isRoleAdmin = (role: string | null) => role === 'admin';

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Daftar Pengguna ({users.length})</h3>
        
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2 border border-red-200">
             <ExclamationCircleIcon className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}
        {successMsg && (
           <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md flex items-center gap-2 border border-emerald-200">
             <CheckCircleIcon className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Pengguna</th>
              <th className="px-6 py-4 font-semibold">Status Role</th>
              <th className="px-6 py-4 font-semibold">Terdaftar Pada</th>
              <th className="px-6 py-4 font-semibold">Login Terakhir</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
               <tr><td colSpan={5} className="py-8 text-center text-slate-500">Tidak ada pengguna ditemukan.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {isRoleAdmin(u.role) ? <ShieldCheckIcon className="w-5 h-5 text-indigo-600" /> : <UserIcon className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{u.full_name || 'Tanpa Nama'}</div>
                      <div className="text-slate-500 text-xs">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                      isRoleAdmin(u.role) 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                      u.is_active === false
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {u.is_active === false ? 'NONAKTIF' : 'AKTIF'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600" suppressHydrationWarning>
                  {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-slate-600" suppressHydrationWarning>
                   {u.last_sign_in_at 
                      ? new Date(u.last_sign_in_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <select 
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={loadingId === u.id}
                        className="text-xs bg-white border border-slate-200 rounded-md py-1 px-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                      >
                         <option value="user">USER Biasa</option>
                         <option value="admin">ADMIN</option>
                      </select>
                      {loadingId === u.id && <ArrowPathIcon className="w-4 h-4 text-indigo-600 animate-spin" />}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleToggleBan(u.id, u.is_active !== false)}
                        disabled={loadingId === u.id}
                        className={`text-[10px] px-2 py-1 rounded border font-semibold transition-colors disabled:opacity-50 ${u.is_active === false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                      >
                        {u.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}
                      </button>
                      <button
                        onClick={() => handleRevokeSession(u.id)}
                        disabled={loadingId === u.id}
                        className="text-[10px] bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 px-2 py-1 rounded font-semibold transition-colors disabled:opacity-50 title-tooltip"
                        title="Akhiri Sesi Login"
                      >
                        Paksa Logout
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
