import { ChatBubbleLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-20">
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[100px] pointer-events-none select-none"></div>
        <div className="flex-1 z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Nikmati Kelembutan Donat Hari Ini
          </h2>
          <p className="text-slate-200 dark:text-slate-300 text-lg md:text-xl mb-8 max-w-prose leading-relaxed">
            Jangan sampai kehabisan menu terlaris kami. Pesan sekarang melalui WhatsApp untuk pengiriman instan.
          </p>
          <Link 
            href="/catalog"
            className="inline-flex h-14 px-10 bg-primary text-white font-bold rounded-xl text-lg items-center gap-3 shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            Lihat Menu & Pesan
          </Link>
        </div>
        <div className="w-full md:w-1/3 z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <div className="text-white">
                <p className="font-bold">WhatsApp Order</p>
                <p className="text-xs text-slate-400">Online 08:00 - 20:00</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-white/5 rounded-lg w-full"></div>
              <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
