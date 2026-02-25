import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  CalendarDaysIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { getOrderStatus } from '@/lib/order-status';

import idDict from '@/translations/dictionaries/id.json';
import enDict from '@/translations/dictionaries/en.json';
import suDict from '@/translations/dictionaries/su.json';
import jvDict from '@/translations/dictionaries/jv.json';

const dictionaries = { id: idDict, en: enDict, su: suDict, jv: jvDict };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const supabase = await createServerSupabaseClient();
  
  // 1. Authenticate Request
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect('/login');
  }

  // 2. Fetch User Language and Order Data
  const [profileResult, orderResult] = await Promise.all([
    supabase.from('user_profiles').select('language, full_name, phone, address, province_name, city_name, district_name, address_detail').eq('id', authData.user.id).single(),
    supabase.from('orders').select('*').eq('id', orderId).eq('user_id', authData.user.id).single()
  ]);

  if (orderResult.error) {
    console.error(' [Order Detail] Supabase Error fetching order:', orderResult.error.message);
    throw new Error(`Gagal memuat detail pesanan: ${orderResult.error.message}`);
  }

  if (!orderResult.data) {
    notFound();
  }

  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    console.error(' [Order Detail] Supabase Error fetching profile:', profileResult.error.message);
  }

  const order = orderResult.data;
  const lang = (profileResult.data?.language || 'id') as keyof typeof dictionaries;
  const dict = dictionaries[lang] || dictionaries.id;

  // Simple server-side translate helper
  const t = (keyPath: string, variables?: Record<string, string | number>) => {
    const keys = keyPath.split('.');
    let result: unknown = dict;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return keyPath;
      }
    }
    let str = typeof result === 'string' ? result : keyPath;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        str = str.replace(`{${key}}`, String(value));
      });
    }
    return str;
  };

  const currentStatus = getOrderStatus(order.status);
  const StatusIcon = currentStatus.icon;
  const locale = lang === 'en' ? 'en-US' : 'id-ID';

  const profile = profileResult.data;
  const registeredAddress = profile ? `${profile.address_detail || profile.address || ''}, ${profile.district_name || ''}, ${profile.city_name || ''}, ${profile.province_name || ''}`.replace(/^[\s,]+|[\s,]+$/g, '').replace(/,\s*,/g, ',').trim() : '';
  const displayAddress = order.shipping_address || registeredAddress || t('orders.detail.no_address');

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Mobile Top Navbar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <Link 
          href="/profile" 
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="size-6" />
        </Link>
        <h1 className="text-base font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
          {t('orders.detail.title')}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        
        {/* 2. Order Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('orders.detail.id_label')}</p>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${currentStatus.color}`}>
              <StatusIcon className="size-3.5" />
              {t(`orders.status.${order.status}`)}
            </span>
          </div>
          <p className="text-xl font-black text-slate-800 mb-2 font-mono">
            #{order.id.split('-')[0].toUpperCase()}
          </p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
             <CalendarDaysIcon className="size-4" />
             {new Date(order.created_at).toLocaleString(locale, { 
               weekday: 'long', 
               day: 'numeric', 
               month: 'long', 
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
             })}
          </div>
        </div>

        {/* 3. Items List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-4 pb-4 border-b border-slate-50">{t('orders.detail.items_title')}</h2>
          
          <div className="space-y-4">
            {order.items?.map((item: { product_id: string, name: string, price: number, quantity: number, image: string }, index: number) => (
              <div key={item.product_id || index} className="flex gap-4">
                <div className="relative size-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.name || 'Produk'} 
                      fill
                      unoptimized={true}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBagIcon className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{item.name || 'Produk Nonaktif'}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                    <p className="text-sm font-black text-slate-800">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Shipping Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           <h2 className="text-sm font-bold text-slate-800 mb-4 pb-4 border-b border-slate-50">{t('orders.detail.shipping_title')}</h2>
           
           <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('orders.detail.reception_method')}</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {order.delivery_method === 'pickup' ? (
                     <><span className="material-symbols-outlined text-[18px]">storefront</span> {t('orders.reception.pickup')}</>
                  ) : (
                     <><span className="material-symbols-outlined text-[18px]">local_shipping</span> {t('orders.reception.delivery')}</>
                  )}
                </p>
              </div>

              {order.delivery_method === 'delivery' && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('orders.detail.address_label')}</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed mb-2">
                    {displayAddress}
                  </p>
                  {order.shipping_address_notes && (
                    <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 border border-amber-100/50">
                      <MapPinIcon className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-amber-800 italic leading-relaxed">
                        &quot;{order.shipping_address_notes}&quot;
                      </p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* 5. Payment Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           <h2 className="text-sm font-bold text-slate-800 mb-4 pb-4 border-b border-slate-50">{t('orders.detail.payment_title')}</h2>
           
           <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t('orders.detail.subtotal_label')}</span>
                <span className="text-slate-800 font-bold">Rp {(order.total_amount - (order.shipping_fee || 0)).toLocaleString('id-ID')}</span>
              </div>
              
              {order.delivery_method === 'delivery' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('orders.detail.shipping_label')}</span>
                  <span className="text-slate-800 font-bold">Rp {(order.shipping_fee || 0).toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">{t('orders.detail.total_label')}</span>
                <span className="text-lg md:text-xl font-black text-primary">Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
