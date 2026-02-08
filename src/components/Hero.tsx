import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-10 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full w-max">
              Artisan Bakery
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-heading dark:text-white">
              Donat Keluarga: Resep Tradisional, Rasa Internasional
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[500px]">
              Hadirkan kebahagiaan di setiap gigitan dengan donat artisan buatan keluarga kami yang lembut dan kaya rasa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/catalog"
              className="h-14 px-8 bg-primary text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform shadow-xl shadow-primary/30"
            >
              <span>Pesan Sekarang</span>
              <ShoppingCartIcon className="w-6 h-6" />
            </Link>
            <Link 
              href="/#top-picks"
              className="h-14 px-8 bg-white dark:bg-slate-800 text-heading dark:text-white border border-[#e7edf3] dark:border-slate-700 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Lihat Menu
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="aspect-square w-full bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
            <Image
              alt="Close up of various glazed donuts with colorful toppings"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI3IWpmYHgR98Ur1-66YxZ2ryIyIMVbqVUoLdFr_AISaIzl_5mFliSL7D44I1BdbXx60LPMFIl-bS6BZY5LFWAFAri2laAcBuvA7x7gRW-eW9_CRkI84H6N4LgIm79LyxSjXLSqyDznSbejoRSVEE4YEz-p_5xDL13LdS7uX6RUVwV1GuAxlJEypis0wUXADkzEQic7vMV1sqN1tc63rYrBeorYtS6J5YpG4yphV3LbR9rHJOkkzxKdYGLd7GPWOASaPR9KjvvC-BZ"
              width={800}
              height={800}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
