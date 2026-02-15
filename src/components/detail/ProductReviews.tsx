'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { 
  getProductReviews, 
  getProductReviewStats, 
  getUserReviewForProduct 
} from '@/app/actions/review-actions';
import type { ProductReview, ReviewStats as ReviewStatsType } from '@/types/cms';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStatsType | null>(null);
  const [userReview, setUserReview] = useState<ProductReview | null | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const INITIAL_DISPLAY_COUNT = 5;

  const loadReviewData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      // Load all data in parallel
      const [reviewsResult, statsResult, userReviewResult] = await Promise.all([
        getProductReviews(productId, 100), // Load up to 100 reviews
        getProductReviewStats(productId),
        user ? getUserReviewForProduct(productId) : Promise.resolve({ success: true, data: null }),
      ]);

      if (reviewsResult.success) {
        setReviews(reviewsResult.data || []);
      }

      if (statsResult.success) {
        setStats(statsResult.data || null);
      }

      if (userReviewResult.success) {
        setUserReview(userReviewResult.data);
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, supabase]);

  useEffect(() => {
    loadReviewData();
  }, [loadReviewData]);

  const handleReviewSuccess = () => {
    // Refresh all review data
    loadReviewData();
  };

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    router.push(`/login?next=${currentPath}`);
  };

  const displayedReviews = showAllReviews 
    ? reviews 
    : reviews.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMoreReviews = reviews.length > INITIAL_DISPLAY_COUNT;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-100 rounded-2xl h-48 animate-pulse" />
        <div className="bg-slate-100 rounded-2xl h-32 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wider">
          Ulasan Produk
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Lihat apa kata pelanggan kami tentang produk ini
        </p>
      </div>

      {/* Review Statistics */}
      {stats && <ReviewStats stats={stats} />}

      {/* Review Form - Show if user is logged in and hasn't reviewed yet */}
      {currentUserId ? (
        userReview ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-700">
              ✓ Anda sudah memberikan ulasan untuk produk ini. Anda dapat mengeditnya di bawah.
            </p>
          </div>
        ) : (
          <ReviewForm 
            productId={productId} 
            onSuccess={handleReviewSuccess}
          />
        )
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm text-slate-600">
            Login untuk memberikan ulasan
          </p>
          <button
            onClick={handleLoginRedirect}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Semua Ulasan ({reviews.length})
        </h3>
        
        <ReviewList
          reviews={displayedReviews}
          currentUserId={currentUserId}
          productId={productId}
          onReviewDeleted={handleReviewSuccess}
        />

        {/* Show More Button */}
        {hasMoreReviews && !showAllReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="w-full py-3 px-6 border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors"
          >
            Lihat Semua Ulasan ({reviews.length - INITIAL_DISPLAY_COUNT} lainnya)
          </button>
        )}
      </div>
    </div>
  );
}
