import { CakeIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function CatalogCTA() {
  return (
    <div className="mt-12 mb-20">
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 md:px-16 md:py-16 text-center shadow-lg">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
          <CakeIcon className="w-[300px] h-[300px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-white text-3xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              Siap untuk Mencoba?
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Pilih donat favorit Anda dan pesan langsung melalui WhatsApp. Kami akan mengonfirmasi pesanan Anda segera!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center justify-center gap-3 rounded-xl h-14 px-8 bg-white text-primary text-base font-bold hover:bg-slate-100 transition-all shadow-md">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>Order via WhatsApp</span>
            </button>
            <button className="flex items-center justify-center gap-3 rounded-xl h-14 px-8 bg-primary/20 border border-white/30 text-white text-base font-bold hover:bg-primary/30 transition-all">
              <span>Download Price List</span>
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
