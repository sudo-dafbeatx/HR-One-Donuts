'use client';

import { LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AutomatedInsightsWidgetProps {
  stats: {
    productCount: number;
    orderCount: number;
    userCount: number;
    activeUsersToday: number;
  }
}

export default function AutomatedInsightsWidget({ stats }: AutomatedInsightsWidgetProps) {
  const insights = [];

  if (stats.productCount === 0) {
    insights.push({
      id: 'no-prod',
      text: 'Website masih kosong. Tambahkan minimal 4-6 produk agar etalase homepage terlihat penuh dan menarik.',
      type: 'critical'
    });
  } else if (stats.productCount < 8) {
    insights.push({
      id: 'low-prod',
      text: 'Variasi produk membantu konversi. Coba tambahkan varian rasa donat baru bulan ini!',
      type: 'tip'
    });
  }

  if (stats.orderCount === 0 && stats.productCount > 0) {
    insights.push({
      id: 'no-order',
      text: 'Produk sudah ada tapi belum ada pesanan? Pastikan link WhatsApp di pengaturan sudah benar.',
      type: 'critical'
    });
  }

  if (stats.userCount > 0 && stats.activeUsersToday === 0) {
    insights.push({
      id: 'inactive-users',
      text: 'Traffic hari ini sedang landai. Coba buat broadcast promo Flash Sale untuk menarik user kembali.',
      type: 'tip'
    });
  }

  // Default fallback if no specific insights
  if (insights.length === 0) {
    insights.push({
      id: 'default',
      text: 'Semua sistem berjalan normal. Pantau statistik harian untuk melihat tren pertumbuhan toko Anda.',
      type: 'tip'
    });
  }

  return (
    <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-lg shadow-xl p-4 md:p-5 text-white h-fit max-h-[60vh] md:max-h-[420px] flex flex-col relative overflow-hidden group">
      {/* Decorative SVG background */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
        <SparklesIcon className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col h-full auto-rows-max overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <LightBulbIcon className="w-4 h-4 text-amber-300 fill-amber-300" />
          <h4 className="text-xs font-black uppercase tracking-wider leading-none">Smart Insights</h4>
        </div>

        {/* Scrollable List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 shrink">
          {insights.map((insight, index) => (
            <div 
              key={insight.id} 
              className={`bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-lg ${
                index >= 2 ? 'hidden md:block' : ''
              } ${
                index >= 3 ? 'hidden!' : ''
              }`}
            >
              <p className="text-[12px] md:text-[13px] font-medium leading-snug italic text-white/90">
                &quot;{insight.text}&quot;
              </p>
            </div>
          ))}

          {/* Tombol Lihat Semua (Mobile & Desktop) */}
          {insights.length > 2 && (
            <div className="pt-0.5 md:hidden">
              <button 
                type="button" 
                className="text-[10px] font-semibold text-white/70 hover:text-white transition-colors"
              >
                + {insights.length - 2} Insight Lainnya
              </button>
            </div>
          )}
          {insights.length > 3 && (
            <div className="pt-0.5 hidden md:block">
              <button 
                type="button" 
                className="text-[11px] font-semibold text-white/70 hover:text-white transition-colors"
              >
                + {insights.length - 3} Insight Lainnya
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-[9px] font-bold text-white/50 tracking-widest uppercase">AI Engine Beta</div>
          <SparklesIcon className="w-3.5 h-3.5 text-white/40" />
        </div>
      </div>
    </div>
  );
}
