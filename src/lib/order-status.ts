import { 
  CheckCircleIcon, 
  ClockIcon, 
  CreditCardIcon, 
  ShoppingBagIcon, 
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export const ORDER_STATUS_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}> = {
  pending: { 
    label: 'Menunggu Diproses', 
    color: 'bg-amber-100 text-amber-700', 
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: ClockIcon 
  },
  paid: { 
    label: 'Dibayar', 
    color: 'bg-blue-100 text-blue-700', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: CreditCardIcon 
  },
  processing: { 
    label: 'Diproses', 
    color: 'bg-indigo-100 text-indigo-700', 
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    icon: ShoppingBagIcon 
  },
  shipping: { 
    label: 'Dikirim', 
    color: 'bg-purple-100 text-purple-700', 
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: TruckIcon 
  },
  completed: { 
    label: 'Selesai', 
    color: 'bg-green-100 text-green-700', 
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircleIcon 
  },
  cancelled: { 
    label: 'Dibatalkan', 
    color: 'bg-red-100 text-red-700', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: XCircleIcon 
  },
};

export function getOrderStatus(status: string) {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
}
