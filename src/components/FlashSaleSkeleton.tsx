'use client';

export default function FlashSaleSkeleton() {
  return (
    <div className="w-full bg-white py-8 border-b border-slate-100 animate-pulse">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-100 rounded" />
              <div className="h-2 w-20 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>

        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[85%] sm:w-[50%] lg:w-[32%] aspect-[21/10] bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
