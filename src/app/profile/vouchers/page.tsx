'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  TagIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getPublicVouchers, getUserVoucherUsage } from '@/app/actions/voucher-actions';
import type { Voucher, VoucherUsage } from '@/app/actions/voucher-actions';
import { useCart } from '@/context/CartContext';

export default function UserVouchersPage() {
  const router = useRouter();
  const { applyVoucher, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [usageHistory, setUsageHistory] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<Voucher | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [voucherData, usageData] = await Promise.all([
        getPublicVouchers(),
        getUserVoucherUsage()
      ]);
      setVouchers(voucherData);
      setUsageHistory(usageData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUseVoucher = (voucher: Voucher) => {
    applyVoucher(voucher);
    setIsCartOpen(true);
    router.push('/catalog');
  };

  const getShareText = (v: Voucher) => {
    const discountText = v.discount_type === 'percentage'
      ? `${v.discount_value}%`
      : `Rp${v.discount_value.toLocaleString('id-ID')}`;

    return `🍩 Lagi promo di HR-One Donuts!\n\nPakai voucher ini dan hemat ${discountText}:\n\nKode Voucher:\n${v.code}\n\n${v.min_purchase > 0 ? `Minimal pembelian Rp${v.min_purchase.toLocaleString('id-ID')}.\n\n` : ''}Pesan sekarang:\nhttps://hr-one-donuts.vercel.app\n\nJangan sampai kehabisan donatnya! 🍩`;
  };

  const handleShareWhatsApp = (v: Voucher) => {
    const text = encodeURIComponent(getShareText(v));
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareModal(null);
  };

  const handleShareTelegram = (v: Voucher) => {
    const text = encodeURIComponent(getShareText(v));
    window.open(`https://t.me/share/url?url=https://hr-one-donuts.vercel.app&text=${text}`, '_blank');
    setShowShareModal(null);
  };

  const handleCopyLink = (v: Voucher) => {
    navigator.clipboard.writeText(getShareText(v));
    setCopiedCode('share-' + v.code);
    setTimeout(() => setCopiedCode(null), 2000);
    setShowShareModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-6 sticky top-0 z-50 border-b border-slate-100 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <ChevronLeftIcon className="size-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Voucher Saya</h1>
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-slate-100 px-4">
        <div className="flex gap-1 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-all relative ${
              activeTab === 'available'
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Voucher Tersedia
            {activeTab === 'available' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-all relative ${
              activeTab === 'history'
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Riwayat Voucher
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Voucher...</p>
          </div>
        ) : activeTab === 'available' ? (
          /* ========= TAB: Voucher Tersedia ========= */
          vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100">
                <TagIcon className="size-10 text-slate-200" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Belum Ada Voucher</p>
                <p className="text-sm text-slate-500 font-medium">Nantikan promo menarik dari kami!</p>
              </div>
            </div>
          ) : (
            vouchers.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Voucher Header */}
                <div className="bg-linear-to-r from-primary to-blue-500 p-5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="size-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                      <TagIcon className="size-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                        {v.discount_type === 'percentage' ? 'Diskon Persen' : 'Potongan Harga'}
                      </p>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        {v.discount_type === 'percentage'
                          ? `${v.discount_value}%`
                          : `Rp ${v.discount_value.toLocaleString('id-ID')}`}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Voucher Body */}
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">{v.title}</h4>
                    {v.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{v.description}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Min. Beli: <strong className="text-slate-700">Rp {v.min_purchase.toLocaleString('id-ID')}</strong></span>
                    </div>
                    {v.max_discount && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Maks. Diskon: <strong className="text-slate-700">Rp {v.max_discount.toLocaleString('id-ID')}</strong></span>
                      </div>
                    )}
                    {(v.start_date || v.end_date) && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <ClockIcon className="size-3" />
                        <span>
                          {v.start_date && `Mulai ${new Date(v.start_date).toLocaleDateString('id-ID')}`}
                          {v.start_date && v.end_date && ' — '}
                          {v.end_date && `Berakhir ${new Date(v.end_date).toLocaleDateString('id-ID')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Voucher Code Badge */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <span className="text-sm font-black text-primary tracking-widest">{v.code}</span>
                    <button
                      onClick={() => handleCopy(v.code)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        copiedCode === v.code
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-slate-600 hover:bg-primary hover:text-white border border-slate-200 hover:border-transparent'
                      }`}
                    >
                      {copiedCode === v.code ? (
                        <>
                          <CheckCircleIcon className="size-3.5" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="size-3.5" />
                          Salin
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUseVoucher(v)}
                      className="flex-1 h-11 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                      Gunakan Voucher
                    </button>
                    <button
                      onClick={() => setShowShareModal(v)}
                      className="h-11 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <ShareIcon className="size-4" />
                      Bagikan
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          /* ========= TAB: Riwayat Voucher ========= */
          usageHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100">
                <GiftIcon className="size-10 text-slate-200" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Belum Ada Riwayat</p>
                <p className="text-sm text-slate-500 font-medium">Gunakan voucher saat checkout dan riwayatnya akan muncul di sini.</p>
              </div>
            </div>
          ) : (
            usageHistory.map((usage) => (
              <div
                key={usage.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100"
              >
                <div className="flex gap-4">
                  <div className="size-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50">
                    <CheckCircleIcon className="size-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-black text-sm leading-tight text-slate-900">
                        {usage.voucher_code}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 shrink-0">
                        Digunakan
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      Diskon: <strong className="text-primary">Rp {usage.discount_value.toLocaleString('id-ID')}</strong>
                    </p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(usage.used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-110 flex items-end justify-center p-4 pb-[calc(68px+env(safe-area-inset-bottom)+1rem)]">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setShowShareModal(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bagikan Voucher</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {showShareModal.code} — {showShareModal.title}
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(null)}
                className="size-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-all"
              >
                <XMarkIcon className="size-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* WhatsApp */}
              <button
                onClick={() => handleShareWhatsApp(showShareModal)}
                className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 active:scale-[0.98] transition-all"
              >
                <div className="size-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="size-5 fill-white" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.271.607-1.445c.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-green-800">WhatsApp</p>
                  <p className="text-[10px] text-green-600 font-medium">Kirim ke chat atau Status</p>
                </div>
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShareTelegram(showShareModal)}
                className="w-full flex items-center gap-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 hover:bg-sky-100 active:scale-[0.98] transition-all"
              >
                <div className="size-10 bg-sky-500 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="size-5 fill-white" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-sky-800">Telegram</p>
                  <p className="text-[10px] text-sky-600 font-medium">Bagikan ke kontak Telegram</p>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleCopyLink(showShareModal)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border active:scale-[0.98] transition-all ${
                  copiedCode === 'share-' + showShareModal.code
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  copiedCode === 'share-' + showShareModal.code ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  {copiedCode === 'share-' + showShareModal.code ? (
                    <CheckCircleIcon className="size-5 text-white" />
                  ) : (
                    <ClipboardDocumentIcon className="size-5 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${copiedCode === 'share-' + showShareModal.code ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {copiedCode === 'share-' + showShareModal.code ? 'Teks Disalin!' : 'Salin Teks'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Salin pesan promo ke clipboard</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
