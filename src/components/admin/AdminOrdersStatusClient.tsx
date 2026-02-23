'use client';

import { useState } from 'react';
import { 
  getOrderStatus, 
  DeliveryMethod, 
  STATUS_FLOWS,
  ORDER_STATUS_CONFIG 
} from '@/lib/order-status';
import { updateOrderStatus } from '@/app/admin/actions';
import { 
  TruckIcon 
} from '@heroicons/react/24/outline';

interface AdminOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_method: string;
  profiles?: { full_name: string | null } | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

export default function AdminOrdersStatusClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status. Silakan coba lagi.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 italic text-slate-400">
          Belum ada pesanan yang masuk.
        </div>
      ) : orders.map(order => {
        const status = getOrderStatus(order.status);
        const method = (order.delivery_method === 'pickup' ? 'pickup' : 'delivery') as DeliveryMethod;
        const flow = STATUS_FLOWS[method];
        const isProcessing = updating === order.id;

        return (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
            {/* Row 1: ID & Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-800 text-sm truncate max-w-[120px]">
                  {order.profiles?.full_name || 'Pelanggan'}
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${status.bgColor} ${status.textColor}`}>
                <status.icon className="size-3" />
                {status.label}
              </span>
            </div>

            {/* Row 2: Method & Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {order.delivery_method === 'pickup' ? (
                    <span className="flex items-center gap-1 text-indigo-600">
                      <span className="material-symbols-outlined text-[14px]">storefront</span>
                      <span>Ambil di Toko</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-600">
                      <TruckIcon className="size-3.5" />
                      <span>Antar ke Rumah</span>
                    </span>
                  )}
                </div>
                <div className="size-1 bg-slate-200 rounded-full" />
                <span className="text-slate-800 font-bold">Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <span className="text-[10px]">
                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Row 3: Sequential Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {flow.map((statusKey: string) => {
                const stepConfig = ORDER_STATUS_CONFIG[statusKey];
                if (!stepConfig) return null;

                const isCurrent = order.status === statusKey;
                const currentIndex = flow.indexOf(order.status);
                const stepIndex = flow.indexOf(statusKey);
                
                // Only allow click if it's the IMMEDIATELY NEXT step
                const isNext = stepIndex === currentIndex + 1;
                const canClick = isNext && !isProcessing;
                const isDone = stepIndex <= currentIndex;

                return (
                  <button
                    key={statusKey}
                    onClick={() => canClick && handleStatusUpdate(order.id, statusKey)}
                    disabled={!canClick && !isCurrent}
                    className={`relative py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                      isCurrent 
                        ? `${stepConfig.bgColor} ${stepConfig.textColor} border-current shadow-sm` 
                        : isDone
                          ? 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                          : 'bg-white text-slate-300 border-slate-100 opacity-40 grayscale pointer-events-none'
                    } ${canClick ? 'opacity-100 grayscale-0 border-primary/20 hover:border-primary hover:bg-primary/5 cursor-pointer ring-2 ring-primary/5' : ''}`}
                  >
                    {isProcessing && isNext && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                        <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <stepConfig.icon className={`size-4 ${isCurrent ? 'scale-110' : ''}`} />
                    <span className="truncate w-full text-center">{stepConfig.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
