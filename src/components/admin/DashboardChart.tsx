'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface OrderData {
  created_at: string;
  total_amount: number;
}

interface DashboardChartProps {
  orders: OrderData[];
}

interface ChartDataItem {
  name: string;
  date: string;
  Pendapatan: number;
}

export default function DashboardChart({ orders }: DashboardChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Process orders into daily revenue
    const processData = () => {
      if (!orders || orders.length === 0) return [];

      const dailyRevenue: Record<string, number> = {};
      
      // Get the last 7 days including today
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyRevenue[dateStr] = 0;
      }

      // Populate with real data
      orders.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        if (dailyRevenue[dateStr] !== undefined) {
          dailyRevenue[dateStr] += (order.total_amount || 0);
        }
      });

      // Format for recharts
      return Object.entries(dailyRevenue).map(([date, revenue]) => {
        const d = new Date(date);
        return {
          name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          Pendapatan: revenue
        } as ChartDataItem;
      });
    };

    // Tunda state update untuk mount render agar tidak bentrok sinkron
    const timer = setTimeout(() => {
      setChartData(processData());
      setIsMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [orders]);

  if (!isMounted) return <div className="h-[300px] bg-slate-50 animate-pulse rounded-lg" />;

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
         <div>
           <h4 className="text-lg font-bold text-slate-800">Tren Penjualan</h4>
           <p className="text-xs text-slate-500">7 Hari Terakhir</p>
         </div>
         <div className="flex bg-slate-100 p-1 rounded-md">
            <button 
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${chartType === 'bar' ? 'bg-white text-[#1b00ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bar
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${chartType === 'line' ? 'bg-white text-[#1b00ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Line
            </button>
         </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={300} minHeight={300}>
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tickFormatter={(value: any) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => {
                  const numVal = Number(value) || 0;
                  return [`Rp ${numVal.toLocaleString('id-ID')}`, 'Pendapatan'];
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.date || label}
              />
              <Bar 
                dataKey="Pendapatan" 
                fill="#1b00ff" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1500}
              />
            </BarChart>
          ) : (
             <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tickFormatter={(value: any) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => {
                  const numVal = Number(value) || 0;
                  return [`Rp ${numVal.toLocaleString('id-ID')}`, 'Pendapatan'];
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.date || label}
              />
              <Line 
                type="monotone" 
                dataKey="Pendapatan" 
                stroke="#1b00ff" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1b00ff', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
