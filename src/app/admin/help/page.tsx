import { Metadata } from 'next';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Bantuan | Admin Panel',
  description: 'Pusat bantuan admin sistem',
};

export default function AdminHelpPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pusat Bantuan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Panduan dan informasi bantuan operasi Admin.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
          <QuestionMarkCircleIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Pusat Bantuan Segera Hadir</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Halaman dokumentasi dan FAQ Admin sedang dipersiapkan dan akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
