'use client';

import { useState } from 'react';
import { submitReview } from '@/app/actions/submit-review';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UnreviewedItem {
  product_id: string;
  name: string;
  image: string;
}

export default function OrderReviewModal({
  orderId,
  items
}: {
  orderId: string;
  items: UnreviewedItem[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>(
    items.reduce((acc, item) => ({ ...acc, [item.product_id]: { rating: 5, comment: '' } }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRating = (productId: string, rating: number) => {
    setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], rating } }));
  };

  const handleComment = (productId: string, comment: string) => {
    setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], comment } }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const reviewPayload = items.map(item => ({
        product_id: item.product_id,
        rating: reviews[item.product_id].rating,
        comment: reviews[item.product_id].comment
      }));

      const result = await submitReview(orderId, reviewPayload);

      if (result.success) {
        // Force refresh to reload the server component state
        router.refresh();
      } else {
        setError(result.error || 'Gagal mengirim ulasan.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">📝 Bantu Kami Lebih Baik</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Pesanan Anda telah selesai! Silakan berikan ulasan untuk produk yang Anda beli untuk mendapatkan <span className="text-orange-500 font-bold">+10 Poin Reward</span> per produk.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {items.map(item => (
            <div key={item.product_id} className="bg-white border text-center border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
               
               <div className="flex flex-col items-center gap-3">
                 <div className="size-16 relative rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                   {item.image ? (
                     <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">🍩</div>
                   )}
                 </div>
                 <h3 className="font-bold text-slate-800 mt-1 text-sm">{item.name}</h3>
               </div>

               {/* Star Rating */}
               <div className="flex items-center justify-center gap-2 mt-4">
                 {[1, 2, 3, 4, 5].map(star => (
                   <button
                     key={star}
                     onClick={() => handleRating(item.product_id, star)}
                     className="transform active:scale-95 transition-transform"
                   >
                     {star <= reviews[item.product_id].rating ? (
                       <StarIcon className="size-8 text-amber-400 drop-shadow-sm" />
                     ) : (
                       <StarOutline className="size-8 text-slate-200" />
                     )}
                   </button>
                 ))}
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-4">
                 Beri Rating (1-5)
               </p>

               <textarea
                 placeholder="Bagaimana rasanya? Ceritakan pengalamanmu..."
                 value={reviews[item.product_id].comment}
                 onChange={(e) => handleComment(item.product_id, e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                 rows={3}
                 maxLength={500}
               />
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Kirim Ulasan & Ambil Poin</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
