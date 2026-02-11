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
  description = "Nikmati kelembutan donat ragi premium kami yang dibuat dengan resep rahasia keluarga. Tekstur yang lembut lumer di mulut dengan varian rasa mewah yang memanjakan lidah.",
  ctaText = "Lihat Menu",
  ctaLink = "/catalog",
  imageUrl
}: HeroProps) {
  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center px-6 py-20 lg:px-40 overflow-hidden bg-background transition-colors duration-500">
      {/* Decorative Ornaments (Lightweight SVG) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-0" />

      <div className="container relative z-10 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 backdrop-blur-sm">
            <SparklesIcon className="w-4 h-4" />
            <span className="uppercase tracking-widest">{subtitle}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-heading leading-[1.05] tracking-tight">
            {title.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "text-primary block" : "block text-heading"}>
                {word}
              </span>
            ))}
          </h1>
          
          <p className="text-lg md:text-xl text-subheading leading-relaxed max-w-xl">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link 
              href={ctaLink}
              className="group relative flex items-center justify-center gap-3 rounded-2xl h-16 px-10 bg-primary text-white text-lg font-extrabold hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/30"
            >
              {ctaText}
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#how-to-order"
              className="group flex items-center justify-center rounded-2xl h-16 px-10 border-2 border-border text-heading text-lg font-bold hover:bg-card-bg transition-all duration-300"
            >
              Pelajari Cara Pesan
            </Link>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="relative flex justify-center items-center lg:justify-end">
          <div className="relative w-full aspect-square max-w-[500px] animate-float">
            {imageUrl ? (
              <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            ) : (
              // Fallback visual if no image is available
              <div className="w-64 h-64 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-32 h-32 bg-primary/40 rounded-full" />
              </div>
            )}
            
            {/* Floatings items to add modern vibe */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-xl flex flex-col items-center justify-center -rotate-12 animate-float-delayed">
              <span className="text-2xl">🍩</span>
              <span className="text-[10px] font-bold text-slate-400">FRESHLY BAKED</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-10px) rotate(-8deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite 1s; }
      `}</style>
    </section>
  );
}
