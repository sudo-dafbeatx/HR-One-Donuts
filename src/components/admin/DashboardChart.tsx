'use client';

import { useState, useEffect } from 'react';

interface OrderData {
  created_at: string;
  total_amount: number;
}

interface DashboardChartProps {
  orders: OrderData[];
}

interface ChartDataItem {
  name: string; // "Sen", "Sel", dll
  date: string; // "14 Okt"
  Pendapatan: number;
  Transactions: number;
  heightPercent: number;
}

export default function DashboardChart({ orders }: DashboardChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [stats, setStats] = useState({
    recentRevenue: 0,
    recentTransactions: 0,
    revenueChange: 0,
    transactionChange: 0
  });
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Process orders into daily revenue
    const processData = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const dailyRevenue: Record<string, { revenue: number; transactions: number }> = {};
      
      // Initialize the last 14 days to zero
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyRevenue[dateStr] = { revenue: 0, transactions: 0 };
      }

      // Populate with real data
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          const dateStr = new Date(order.created_at).toISOString().split('T')[0];
          if (dailyRevenue[dateStr] !== undefined) {
            dailyRevenue[dateStr].revenue += (order.total_amount || 0);
            dailyRevenue[dateStr].transactions += 1;
          }
        });
      }

      // Split into "Last 7 Days" and "Previous 7 Days"
      const dates = Object.keys(dailyRevenue).sort();
      const prev7Dates = dates.slice(0, 7);
      const recent7Dates = dates.slice(7, 14);

      let prevRevenue = 0;
      let prevTrans = 0;
      prev7Dates.forEach(date => {
        prevRevenue += dailyRevenue[date].revenue;
        prevTrans += dailyRevenue[date].transactions;
      });

      let recentRevenue = 0;
      let recentTrans = 0;
      recent7Dates.forEach(date => {
        recentRevenue += dailyRevenue[date].revenue;
        recentTrans += dailyRevenue[date].transactions;
      });

      // Calculate percentage changes
      const revChange = prevRevenue === 0 
        ? (recentRevenue > 0 ? 100 : 0) 
        : ((recentRevenue - prevRevenue) / prevRevenue) * 100;

      const transChange = prevTrans === 0 
        ? (recentTrans > 0 ? 100 : 0) 
        : ((recentTrans - prevTrans) / prevTrans) * 100;

      setStats({
        recentRevenue,
        recentTransactions: recentTrans,
        revenueChange: revChange,
        transactionChange: transChange
      });

      // Format for the chart (only the last 7 days)
      const maxRevenue = Math.max(...recent7Dates.map(d => dailyRevenue[d].revenue));
      
      return recent7Dates.map((date) => {
        const d = new Date(date);
        const revenue = dailyRevenue[date].revenue;
        const heightPercent = maxRevenue === 0 ? 5 : Math.max(5, (revenue / maxRevenue) * 100);

        return {
          name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          Pendapatan: revenue,
          Transactions: dailyRevenue[date].transactions,
          heightPercent
        } as ChartDataItem;
      });
    };

    // Delay state update for mount render to avoid hydration mismatch
    const timer = setTimeout(() => {
      setChartData(processData());
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [orders]);

  if (!isMounted) {
    return <div className="h-[400px] bg-slate-50 animate-pulse rounded-2xl w-full" />;
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(1)}K`;
    return `Rp ${val}`;
  };

  return (
    <div className="w-full relative overflow-hidden rounded-2xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Background Glow Effect - Bound to Global Theme */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-500"
        style={{ background: 'var(--color-primary, #1152d4)' }}
      />
      
      <div className="p-5 md:p-6 w-full relative z-10 flex flex-col h-full min-h-[400px]">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
             <h4 className="text-xl font-black text-slate-800 tracking-tight">Tren Penjualan</h4>
             <p className="text-sm font-semibold text-slate-400 mt-1">7 Hari Terakhir</p>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <div className="flex items-end justify-end gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-800 leading-none">
                  {formatCurrency(stats.recentRevenue)}
                </span>
              </div>
              <div className={`text-xs font-bold flex items-center justify-end gap-1 mt-1 ${stats.revenueChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <span className="material-symbols-outlined text-[14px]">
                  {stats.revenueChange >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
              </div>
            </div>

            <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>

            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order</p>
              <div className="flex items-end justify-end gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-800 leading-none">
                  {stats.recentTransactions}
                </span>
              </div>
              <div className={`text-xs font-bold flex items-center justify-end gap-1 mt-1 ${stats.transactionChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                 <span className="material-symbols-outlined text-[14px]">
                  {stats.transactionChange >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {stats.transactionChange > 0 ? '+' : ''}{stats.transactionChange.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* CSS Chart Section */}
        <div className="flex-1 w-full mt-auto relative pt-12 flex items-end justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Background Grid Lines (Decorative) */}
          <div className="absolute inset-x-0 bottom-6 top-10 flex flex-col justify-between pointer-events-none z-0">
             <div className="w-full border-t border-dashed border-slate-100"></div>
             <div className="w-full border-t border-dashed border-slate-100"></div>
             <div className="w-full border-t border-dashed border-slate-100"></div>
             <div className="w-full border-t border-dashed border-slate-100 opacity-0"></div>
          </div>

          {chartData.map((data, idx) => (
            <div 
              key={idx} 
              className="group/bar relative flex flex-col items-center justify-end flex-1 h-full z-10"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <div 
                className={`absolute bottom-full mb-3 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 z-50 flex flex-col gap-1 ${hoveredIndex === idx ? 'opacity-100 transform-none' : 'opacity-0 translate-y-2'}`}
              >
                  <span className="font-bold text-slate-300">{data.date}</span>
                  <span className="font-black text-sm">Rp {data.Pendapatan.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{data.Transactions} Transaksi</span>
                  
                  {/* Tooltip chevron */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>

              {/* The Bar */}
              <div className="w-full max-w-[48px] bg-slate-50 rounded-t-lg relative overflow-hidden group-hover/bar:bg-slate-100 transition-colors duration-300 h-full flex items-end">
                <div 
                  className="w-full rounded-t-lg transition-all duration-1000 ease-out relative group-hover/bar:brightness-110"
                  style={{ 
                    height: `${data.heightPercent}%`,
                    background: 'var(--color-primary, #1152d4)',
                    boxShadow: hoveredIndex === idx ? '0 0 12px 0 var(--color-primary, rgba(17, 82, 212, 0.4))' : 'none'
                  }}
                >
                  {/* Inner shine effect */}
                  <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="mt-3 text-[10px] sm:text-xs font-bold text-slate-400 group-hover/bar:text-slate-800 transition-colors">
                {data.name}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
