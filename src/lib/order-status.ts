import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export const ORDER_STATUS_CONFIG: Record<string, { 
  label: string; 
  userLabel: string;
  color: string; 
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}> = {
  pending: { 
    label: 'Diproses', 
    userLabel: 'Diproses',
    color: 'bg-amber-100 text-amber-700', 
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: ClockIcon 
  },
  shipping: { 
    label: 'Diantar', 
    userLabel: 'Diantar',
    color: 'bg-blue-100 text-blue-700', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: TruckIcon 
  },
  ready: { 
    label: 'Sudah Siap', 
    userLabel: 'Sudah Siap',
    color: 'bg-indigo-100 text-indigo-700', 
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    icon: ClipboardDocumentCheckIcon 
  },
  completed: { 
    label: 'Success', 
    userLabel: 'Selesai',
    color: 'bg-green-100 text-green-700', 
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircleIcon 
  },
  cancelled: { 
    label: 'Dibatalkan', 
    userLabel: 'Dibatalkan',
    color: 'bg-red-100 text-red-700', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: XCircleIcon 
  },
};

export type DeliveryMethod = 'delivery' | 'pickup';

export const STATUS_FLOWS: Record<DeliveryMethod, string[]> = {
  delivery: ['pending', 'shipping', 'completed'],
  pickup: ['pending', 'ready', 'completed']
};

export function getOrderStatus(status: string) {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
}

export function getNextStatus(currentStatus: string, method: DeliveryMethod): string | null {
  const flow = STATUS_FLOWS[method] || STATUS_FLOWS.delivery;
  const currentIndex = flow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === flow.length - 1) return null;
  return flow[currentIndex + 1];
}
