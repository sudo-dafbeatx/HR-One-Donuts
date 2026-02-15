'use client';

import { useState } from 'react';
import Image from 'next/image';
import StarRating from '@/components/ui/StarRating';
import { deleteReview } from '@/app/actions/review-actions';
import ReviewForm from './ReviewForm';
import type { ProductReview } from '@/types/cms';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ReviewListProps {
  reviews: ProductReview[];
  currentUserId?: string;
  productId: string;
  onReviewDeleted?: () => void;
}

export default function ReviewList({ 
  reviews, 
  currentUserId, 
  productId,
  onReviewDeleted 
}: ReviewListProps) {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      const result = await deleteReview(reviewId, productId);
      if (result.success && onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 30) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-slate-400 text-sm">
          Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwnReview = currentUserId && review.user_id === currentUserId;
        const isEditing = editingReviewId === review.id;
        const isDeleting = deletingReviewId === review.id;

        if (isEditing) {
          return (
            <div key={review.id}>
              <ReviewForm
                productId={productId}
                existingReview={review}
                onSuccess={() => setEditingReviewId(null)}
              />
              <button
                onClick={() => setEditingReviewId(null)}
                className="mt-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Batal
              </button>
            </div>
          );
        }

        return (
          <div
            key={review.id}
            className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow"
          >
            {/* Reviewer Info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {/* Avatar */}
                {review.reviewer_avatar ? (
                  <Image
                    src={review.reviewer_avatar}
                    alt={review.reviewer_name || 'User'}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover border-2 border-slate-100"
                  />
                ) : (
                  <UserCircleIcon className="size-10 text-slate-300" />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-bold text-slate-800">
                      {review.reviewer_name || 'Anonymous User'}
                    </h5>
                    {isOwnReview && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (only for own reviews) */}
              {isOwnReview && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingReviewId(review.id)}
                    className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                    title="Edit ulasan"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                    title="Hapus ulasan"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">
                {review.comment}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
