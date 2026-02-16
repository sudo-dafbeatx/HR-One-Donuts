'use client';

import { PromoEvent } from '@/types/cms';
import Image from 'next/image';
import Link from 'next/link';
import { FireIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const eventIcons: Record<string, React.ElementType> = {
  jumat_berkah: SparklesIcon,
  selasa_mega_sale: FireIcon,
  seasonal: CalendarDaysIcon,
};

export default function PromoBanner({ events }: { events: PromoEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
      <div className="flex gap-4 min-w-full">
        {events.map((event) => {
          const Icon = eventIcons[event.event_type] || SparklesIcon;
          
          return (
            <div 
              key={event.id}
              className="flex-shrink-0 w-[85vw] md:w-[600px] aspect-[21/9] bg-slate-900 rounded-2xl overflow-hidden snap-center relative group shadow-lg"
            >
              {event.banner_image_url ? (
                <Image 
                  src={event.banner_image_url} 
                  alt={event.title} 
                  fill 
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-slate-900 flex items-center justify-center">
                   <Icon className="w-20 h-20 text-white/10" />
                </div>
              )}
              
              <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-primary/90 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
                        {event.event_type.replace('_', ' ')}
                      </span>
                   </div>
                   {event.discount_percent && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide leading-none">
                        DISKON {event.discount_percent}%
                      </span>
                   )}
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-4">
                  {event.title}
                </h3>
                
                <Link 
                  href="/catalog?filter=promo"
                  className="w-fit bg-white text-slate-900 px-6 py-2.5 rounded-xl font-semibold text-xs hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xl"
                >
                   Lihat Promo
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
