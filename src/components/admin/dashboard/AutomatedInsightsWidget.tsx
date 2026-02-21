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
    <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-lg shadow-xl p-6 text-white h-full relative overflow-hidden group">
      {/* Decorative SVG background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 group-hover:rotate-12 transition-transform duration-700">
        <SparklesIcon className="w-64 h-64" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <LightBulbIcon className="w-5 h-5 text-amber-300 fill-amber-300" />
          <h4 className="text-sm font-black uppercase tracking-wider">Smart Insights</h4>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <p className="text-sm font-medium leading-relaxed italic">
                &quot;{insight.text}&quot;
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-[10px] font-bold text-white/50 tracking-widest uppercase">AI Engine Beta</div>
          <SparklesIcon className="w-4 h-4 text-white/40" />
        </div>
      </div>
    </div>
  );
}
