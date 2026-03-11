'use client';

import { useState } from 'react';
import { 
  ChevronLeftIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/app/actions/auth-actions';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } else {
      setError(result.error || 'Gagal memperbarui password.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="size-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
          <CheckCircleIcon className="size-12" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Password Diubah!</h1>
        <p className="text-sm text-slate-500 font-medium mb-8">Password akun kamu telah berhasil diperbarui secara aman.</p>
        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-full origin-left animate-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 sticky top-0 z-50 border-b border-slate-100 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <ChevronLeftIcon className="size-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Ganti Password</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="mb-8 text-center">
            <div className="size-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="size-8" />
            </div>
            <h2 className="text-lg font-black text-slate-800">Ubah Kata Sandi</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Pastikan password baru kamu sulit ditebak orang lain.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Password Baru
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Konfirmasi Password
              </label>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 transition-all placeholder:text-slate-300"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2">
                <ExclamationCircleIcon className="size-5 shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center px-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Keamanan kamu adalah prioritas kami. Semua perubahan diaudit dan dilacak untuk mencegah akses tidak sah.
          </p>
        </div>
      </div>
    </div>
  );
}
