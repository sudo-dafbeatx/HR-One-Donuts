import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 md:px-20 lg:px-40 py-12 lg:py-24 bg-linear-to-b from-white via-white to-slate-50 dark:from-background-dark dark:to-slate-900/50">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        <div className="w-full lg:w-3/5 flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
                Artisan Bakery
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              Resep <span className="text-primary italic">Tradisional</span>, Rasa Internasional
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-[550px] leading-relaxed">
              Hadirkan kebahagiaan di setiap gigitan dengan donat artisan buatan keluarga kami yang lembut, kaya rasa, dan dibuat dengan cinta.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/catalog"
              className="h-16 px-10 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
            >
              <span>Pesan Sekarang</span>
              <ShoppingCartIcon className="w-6 h-6" />
            </Link>
            <Link 
              href="/#top-picks"
              className="h-16 px-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              Lihat Menu
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-2/5 relative">
          <div className="relative aspect-square w-full max-w-[500px] mx-auto group">
            <div className="absolute inset-0 bg-primary/20 rounded-[40px] rotate-6 scale-95 blur-sm transition-transform group-hover:rotate-12 duration-500"></div>
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[40px] -rotate-3 transition-transform group-hover:-rotate-6 duration-500"></div>
            <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] border-4 border-white dark:border-slate-700 z-10 transition-transform group-hover:scale-[1.02] duration-500">
              <Image
                alt="Donat Keluarga Premium Artisan"
                className="w-full h-full object-cover transform transition-transform group-hover:scale-110 duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI3IWpmYHgR98Ur1-66YxZ2ryIyIMVbqVUoLdFr_AISaIzl_5mFliSL7D44I1BdbXx60LPMFIl-bS6BZY5LFWAFAri2laAcBuvA7x7gRW-eW9_CRkI84H6N4LgIm79LyxSjXLSqyDznSbejoRSVEE4YEz-p_5xDL13LdS7uX6RUVwV1GuAxlJEypis0wUXADkzEQic7vMV1sqN1tc63rYrBeorYtS6J5YpG4yphV3LbR9rHJOkkzxKdYGLd7GPWOASaPR9KjvvC-BZ"
                width={800}
                height={800}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
