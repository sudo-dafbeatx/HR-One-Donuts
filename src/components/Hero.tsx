"use client";

import Link from "next/link";
import Image from "next/image";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

export default function Hero({ 
  title = "HR-One Donuts",
  subtitle = "Homemade & Freshly Baked",
  description = "Nikmati kelembutan donat ragi premium kami yang dibuat dengan resep rahasia keluarga. Tekstur yang lembut lumer di mulut dengan varian rasa mewah.",
  ctaText = "Lihat Menu",
  ctaLink = "/catalog",
  imageUrl
}: HeroProps) {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center px-6 py-12 lg:py-24 overflow-hidden bg-background">
      {/* Refined Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-0 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-0 opacity-40" />

      <div className="container relative z-10 mx-auto lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content: 7/12 on Desktop */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-sm">
              <SparklesIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary">{subtitle}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-heading leading-[1.1] tracking-tight">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary italic" : "text-heading"}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link 
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl h-14 px-10 bg-primary text-white text-base font-bold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                {ctaText}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link 
                href="#how-to-order"
                className="inline-flex items-center justify-center rounded-xl h-14 px-8 border border-slate-200 dark:border-slate-800 text-heading text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300"
              >
                Cara Pesan
              </Link>
            </div>
          </div>

          {/* Hero Image Container: 5/12 on Desktop */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Elegant Background Decoration for Image */}
            <div className="absolute inset-0 bg-primary/5 rounded-full scale-110 blur-2xl lg:translate-x-12 translate-y-6" />
            
            <div className="relative w-full aspect-[4/5] md:aspect-square max-w-[450px] animate-float-gentle">
              {imageUrl ? (
                <div className="relative w-full h-full rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-white/20">
                  <Image 
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                  />
                  
                  {/* Subtle glass overlay on image corner */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl animate-scale-in">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-sm">Signature Recipe</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white leading-tight mt-1">Dibuat dengan bahan premium pilihan</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[48px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl">🍩</span>
                    <span className="text-xs font-medium">Image Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-float-gentle { animation: float-gentle 8s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
