'use client';

import StarRating from '@/components/ui/StarRating';
import type { ReviewStats } from '@/types/cms';

interface ReviewStatsProps {
  stats: ReviewStats;
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  const { average_rating, total_reviews } = stats;

  // Calculate percentage for each star level
  const getPercentage = (count: number) => {
    if (total_reviews === 0) return 0;
    return Math.round((count / total_reviews) * 100);
  };

  const starBreakdown = [
    { stars: 5, count: stats.five_star_count },
    { stars: 4, count: stats.four_star_count },
    { stars: 3, count: stats.three_star_count },
    { stars: 2, count: stats.two_star_count },
    { stars: 1, count: stats.one_star_count },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">
        Rating Produk
      </h3>

      {/* Average Rating Display */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
        <div className="flex flex-col items-center shrink-0">
          <div className="text-5xl font-black text-slate-800">
            {average_rating.toFixed(1)}
          </div>
          <StarRating rating={average_rating} readonly size="md" />
          <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tight">
            {total_reviews} {total_reviews === 1 ? 'Ulasan' : 'Ulasan'}
          </div>
        </div>

        {/* Star Breakdown */}
        <div className="w-full space-y-2.5">
          {starBreakdown.map(({ stars, count }) => {
            const percentage = getPercentage(count);
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8 shrink-0">
                  <span className="text-xs font-black text-slate-700">{stars}</span>
                  <svg className="size-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[10px] font-bold text-slate-400 w-8 text-right shrink-0">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {total_reviews === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">
            Belum ada ulasan untuk produk ini
          </p>
        </div>
      )}
    </div>
  );
}
