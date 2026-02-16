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

        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[46%] sm:w-[32%] lg:w-[280px] bg-white border border-slate-100 rounded-2xl p-3 md:p-4 flex flex-col gap-3 h-[120px] md:h-[140px]">
              <div className="flex justify-between items-start">
                <div className="size-8 md:size-10 rounded-xl bg-slate-100" />
                <div className="h-4 w-12 bg-slate-100 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
                <div className="h-2 w-1/2 bg-slate-50 rounded" />
              </div>
              <div className="h-3 w-16 bg-slate-50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
