export default function ProductDetailLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {/* Navbar skeleton */}
      <div className="w-full h-16 bg-white border-b border-gray-100 animate-pulse" />

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-8">
        <div className="max-w-[1200px] w-full">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-4 bg-gray-50 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Image skeleton */}
            <div className="aspect-square w-full bg-gray-100 rounded-2xl animate-pulse" />

            {/* Info skeleton */}
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-12 w-full bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>

          {/* Reviews skeleton */}
          <div className="mt-16 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 w-full bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
