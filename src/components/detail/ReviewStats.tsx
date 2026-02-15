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
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
        Rating Produk
      </h3>

      {/* Average Rating Display */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black text-slate-800">
            {average_rating.toFixed(1)}
          </div>
          <StarRating rating={average_rating} readonly size="md" />
          <div className="text-sm text-slate-500 mt-1">
            {total_reviews} {total_reviews === 1 ? 'ulasan' : 'ulasan'}
          </div>
        </div>

        {/* Star Breakdown */}
        <div className="flex-1 space-y-2">
          {starBreakdown.map(({ stars, count }) => {
            const percentage = getPercentage(count);
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-xs font-bold text-slate-600">{stars}</span>
                  <StarRating rating={1} readonly size="sm" />
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 w-12 text-right">
                  {count}
                </span>
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
