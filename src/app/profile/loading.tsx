export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <div className="w-full h-16 bg-white border-b border-gray-100 animate-pulse" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Menu items skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
