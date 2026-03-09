import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="size-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-orange-500">search_off</span>
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Oops! Halaman Tidak Ditemukan</h1>
      <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
        Sepertinya Anda mengakses tautan yang sudah tidak tersedia atau halaman yang sedang dalam perbaikan. Jangan khawatir, mari kita kembali ke menu utama.
      </p>

      <Link
        href="/"
        className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-xl">home</span>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
