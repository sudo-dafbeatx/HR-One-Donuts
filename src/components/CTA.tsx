import { ChatBubbleLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 md:px-20 lg:px-40 py-24 bg-background">
      <div className="bg-slate-900 rounded-[50px] p-10 md:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative border border-slate-800 shadow-2xl">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-0" />
        
        <div className="relative z-10 lg:w-2/3 text-center lg:text-left space-y-8">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Bawa Kebahagiaan ke Rumah Anda<span className="text-primary">.</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed">
            Pesan sekarang dan nikmati kelembutan donat artisan terbaik kami bersama keluarga tercinta. Kami antar langsung ke pintu Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <Link 
              href="/catalog"
              className="group flex h-16 px-10 bg-primary text-white font-black rounded-2xl text-lg items-center justify-center gap-3 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
            >
              <ChatBubbleLeftIcon className="w-6 h-6" />
              Pesan Sekarang
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/3 z-10">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/30">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white font-black text-lg">Order via WhatsApp</p>
                <p className="text-sm text-green-500 font-bold flex items-center gap-1.5 ">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online Sekarang
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded-full w-full"></div>
              <div className="h-4 bg-white/10 rounded-full w-5/6"></div>
              <div className="h-4 bg-white/10 rounded-full w-4/6 opacity-50"></div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-white/40 text-xs font-bold uppercase tracking-widest">
              <span>EST. Response: 2 Mins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
