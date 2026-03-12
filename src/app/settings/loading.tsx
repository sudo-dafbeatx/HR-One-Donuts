export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <div className="w-full h-14 bg-white border-b border-gray-100 animate-pulse" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
