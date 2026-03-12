export default function CatalogLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
      {/* Navbar skeleton */}
      <div className="w-full h-16 bg-white border-b border-gray-100 animate-pulse" />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10">
        {/* Title skeleton */}
        <div className="mb-10 space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Search bar skeleton */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
        </div>

        {/* Category pills skeleton */}
        <div className="flex gap-2 mb-8 overflow-hidden">
          {[80, 60, 90, 70, 65].map((w, i) => (
            <div key={i} className="h-8 rounded-full bg-gray-100 animate-pulse shrink-0" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-square w-full bg-gray-100 animate-pulse" />
              <div className="p-3 md:p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-50 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 w-10 bg-gray-50 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
