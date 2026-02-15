'use client';

import { useState } from 'react';
import StarRating from '@/components/ui/StarRating';
import { createReview, updateReview } from '@/app/actions/review-actions';
import type { ProductReview } from '@/types/cms';

interface ReviewFormProps {
  productId: string;
  existingReview?: ProductReview | null;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, existingReview, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      setError('Silakan pilih rating bintang');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = isEditing
        ? await updateReview(existingReview.id, rating, comment)
        : await createReview(productId, rating, comment);

      if (result.success) {
        // Reset form if creating new review
        if (!isEditing) {
          setRating(0);
          setComment('');
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
      <h4 className="text-base font-semibold text-slate-800">
        {isEditing ? 'Edit Ulasan Anda' : 'Tulis Ulasan'}
      </h4>

      {/* Star Rating Input */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <StarRating 
            rating={rating} 
            onChange={setRating} 
            size="lg"
          />
          {rating > 0 && (
            <span className="text-sm font-medium text-slate-600">
              ({rating} bintang)
            </span>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-bold text-slate-700">
          Komentar <span className="text-slate-400 font-normal">(opsional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[100px]"
          maxLength={500}
        />
        <div className="text-xs text-slate-400 text-right">
          {comment.length}/500 karakter
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className={`
          w-full py-3 px-6 rounded-xl font-bold text-sm transition-all
          ${isSubmitting || rating === 0
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-lg shadow-primary/20 active:translate-y-0'
          }
        `}
      >
        {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Ulasan' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}
