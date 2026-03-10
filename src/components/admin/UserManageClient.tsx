'use client';

import { useState } from 'react';
import { updateUserRole, updateUserPoints } from '../../app/admin/actions';
import { 
  ShieldCheckIcon, 
  UserIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface UserManageProps {
  userId: string;
  initialRole: string | null;
  initialPoints: number;
}

export default function UserManageClient({ userId, initialRole, initialPoints }: UserManageProps) {
  const [role, setRole] = useState(initialRole || 'user');
  const [points, setPoints] = useState(initialPoints);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleUpdateRole = async (newRole: string) => {
    if (!window.confirm(`Ganti role menjadi ${newRole.toUpperCase()}?`)) return;
    setLoading(true);
    setMsg(null);
    try {
      await updateUserRole(userId, newRole as 'admin' | 'user');
      setRole(newRole);
      setMsg({ type: 'success', text: 'Role berhasil diperbarui!' });
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Gagal update role' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoints = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await updateUserPoints(userId, points);
      setMsg({ type: 'success', text: 'Poin berhasil diperbarui!' });
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setMsg({ type: 'error', text: e.message || 'Gagal update poin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <ShieldCheckIcon className="w-5 h-5 text-primary" /> Kelola Hak Akses & Poin
      </h3>

      {msg && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-sm border ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {msg.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">User Role</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateRole('user')}
              disabled={loading || role === 'user'}
              className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                role === 'user' 
                  ? 'bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              <UserIcon className="w-4 h-4" /> Customer
            </button>
            <button
              onClick={() => handleUpdateRole('admin')}
              disabled={loading || role === 'admin'}
              className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                role === 'admin' 
                  ? 'bg-indigo-600 text-white border-indigo-700' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" /> Admin
            </button>
          </div>
        </div>

        {/* Points Management */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Jumlah Poin</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-800"
            />
            <button
              onClick={handleUpdatePoints}
              disabled={loading || points === initialPoints}
              className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
