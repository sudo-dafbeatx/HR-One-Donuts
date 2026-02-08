import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 md:px-20 lg:px-40 py-12 lg:py-24 bg-background border-b border-border transition-colors duration-300">
      <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        <div className="w-full lg:w-3/5 flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
                Artisan Bakery
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-heading">
              Resep <span className="text-primary italic font-serif">Tradisional</span>, Rasa Internasional
            </h1>
            <p className="text-lg md:text-xl text-subheading max-w-prose leading-relaxed">
              Hadirkan kebahagiaan di setiap gigitan dengan donat artisan buatan keluarga kami yang lembut, kaya rasa, dan dibuat dengan cinta.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/catalog"
              className="h-16 px-10 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <span>Pesan Sekarang</span>
              <ShoppingCartIcon className="w-6 h-6" />
            </Link>
            <Link 
              href="/#top-picks"
              className="h-16 px-10 bg-card-bg text-heading border border-border rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
            >
              Lihat Menu
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-2/5 relative">
          <div className="relative aspect-square w-full max-w-[500px] mx-auto">
            <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 z-10">
              <Image
                alt="Donat Keluarga Premium Artisan"
                className="w-full h-full object-cover"
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
