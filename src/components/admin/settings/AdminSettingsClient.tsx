'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  KeyIcon, 
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminSettingsClient({ currentUsername }: { currentUsername: string }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: currentUsername,
    newPassword: '',
    confirmPassword: ''
  });
  
  const [status, setStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Password baru dan konfirmasi tidak cocok.' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password minimal 8 karakter.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newUsername: formData.newUsername,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui pengaturan.');
      }

      setStatus({ type: 'success', message: 'Kredensial berhasil diperbarui. Silakan gunakan password baru untuk login selanjutnya.' });
      
      // Clear passwords but leave username
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // In case username changed, refresh the page context
      router.refresh();
      
    } catch (err: unknown) {
      setStatus({ type: 'error', message: (err as Error).message || 'Terjadi kesalahan jaringan.' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-indigo-600" />
          Ubah Kredensial Login
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Kredensial ini digunakan untuk masuk ke Admin Panel. Ganti password secara berkala untuk keamanan.
        </p>
      </div>

      <div className="p-6">
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
            status.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : ''
          }`}>
            {status.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
            ) : status.type === 'error' ? (
              <ExclamationCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
            ) : null}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password - Required for authorization */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password Saat Ini <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Masukkan password admin saat ini"
            />
            <p className="text-xs text-slate-500 mt-1">Dibutuhkan untuk memverifikasi perubahan.</p>
          </div>

          <hr className="border-slate-100 my-6" />

          {/* New Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username Admin Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircleIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="newUsername"
                required
                value={formData.newUsername}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="Mis: admin_ganteng"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Tanpa spasi, hindari karakter spesial.</p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Minimal 8 karakter"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              placeholder="Ulangi password baru"
            />
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500 font-medium mt-1">Password tidak cocok.</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={status.type === 'loading' || !formData.currentPassword || !formData.newUsername || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status.type === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : 'Simpan Kredensial Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
