import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPublicVouchers } from '@/app/actions/voucher-actions';
import { SparklesIcon, TagIcon } from '@heroicons/react/24/outline';
import VoucherCopyButton from '@/components/vouchers/VoucherCopyButton';

export const metadata = {
  title: 'Promo & Voucher Digital | HR-One Donuts',
  description: 'Dapatkan berbagai promo dan voucher diskon menarik dari HR-One Donuts!',
};

export default async function VouchersPage() {
  const vouchers = await getPublicVouchers();

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#f5f7fb] pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-4">
              Promo & <span className="text-[#1b00ff]">Voucher Digital</span> 🎁
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Gunakan kode voucher di halaman keranjang saat checkout! Dapatkan penawaran terbaik setiap harinya.
            </p>
          </div>

          {vouchers.length === 0 ? (
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center max-w-2xl mx-auto animate-fade-in-up delay-100 border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TagIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada promo aktif</h3>
              <p className="text-slate-500">Nantikan diskon dan penawaran menarik kami selanjutnya!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((v, i) => (
                <div 
                  key={v.id} 
                  className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(27,0,255,0.1)] transition-all duration-300 hover:-translate-y-1 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="bg-linear-to-r from-[#1b00ff] to-indigo-500 p-6 relative overflow-hidden">
                    <SparklesIcon className="absolute top-2 right-2 w-24 h-24 text-white opacity-10 rotate-12 scale-150" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                        <TagIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                          {v.discount_type === 'percentage' ? 'Diskon Persen' : 'Potongan Harga'}
                        </p>
                        <h3 className="text-2xl font-black text-white leading-none">
                          {v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${v.discount_value.toLocaleString('id-ID')}`}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 relative">
                    <div className="absolute -top-3 left-6 right-6 h-6 bg-white rounded-t-full opacity-50 blur-sm pointer-events-none"></div>
                    
                    <h4 className="text-lg font-bold text-slate-800 mb-2 capitalize leading-tight">{v.title}</h4>
                    {v.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{v.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-6 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <p>Min. Beli: <span className="text-slate-800">Rp {v.min_purchase.toLocaleString('id-ID')}</span></p>
                      </div>
                      {v.max_discount && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <p>Maks. Diskon: <span className="text-slate-800">Rp {v.max_discount.toLocaleString('id-ID')}</span></p>
                        </div>
                      )}
                      {(v.start_date || v.end_date) && (
                        <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                          {v.start_date && <span>Mulai: {new Date(v.start_date).toLocaleDateString('id-ID')}</span>}
                          {v.end_date && <span className="text-red-500/80">Berakhir: {new Date(v.end_date).toLocaleDateString('id-ID')}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                      <span className="text-sm font-black text-[#1b00ff] tracking-widest">{v.code}</span>
                      <VoucherCopyButton code={v.code} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
