import { Metadata } from 'next';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Pengaturan | Admin Panel',
  description: 'Pengaturan sistem admin',
};

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Cog8ToothIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi preferensi admin dan manajemen akun.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
          <Cog8ToothIcon className="w-8 h-8 text-slate-400 animate-spin-slow" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Modul Pengaturan Segera Hadir</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Halaman ini sedang dalam tahap pengembangan. Nantinya Anda dapat mengatur opsi akun dan sistem di sini.
        </p>
      </div>
    </div>
  );
}
