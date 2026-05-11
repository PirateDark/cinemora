export default function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pt-4">
        <div className="h-4 bg-gray-800/50 rounded w-48 mb-8 animate-pulse" />

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Video Player Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="relative aspect-video bg-gray-800/60 rounded-2xl overflow-hidden animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-700/50 border-t-rose-500 rounded-full animate-spin" />
              </div>
            </div>

            {/* Title Bar Skeleton */}
            <div className="mt-4 mb-2 space-y-2">
              <div className="h-6 bg-gray-800/50 rounded w-72 animate-pulse" />
              <div className="h-4 bg-gray-800/30 rounded w-48 animate-pulse" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-gray-800/40 rounded-2xl border border-gray-800 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-gray-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800/60 rounded w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 bg-gray-800 rounded-full w-14" />
                    <div className="h-5 bg-gray-800 rounded-full w-14" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-2xl border border-gray-800 p-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
              <div className="flex gap-2">
                <div className="h-7 bg-gray-800 rounded-full w-16" />
                <div className="h-7 bg-gray-800 rounded-full w-20" />
                <div className="h-7 bg-gray-800 rounded-full w-14" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
