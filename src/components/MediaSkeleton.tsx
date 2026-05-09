export default function MediaSkeleton() {
  return (
    <div className="animate-pulse rounded-xl overflow-hidden bg-gray-800/50 border border-gray-800/30">
      <div className="aspect-[2/3] bg-gray-800/80 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent" />
      </div>
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-700/80 rounded w-3/4" />
        <div className="h-2.5 bg-gray-700/50 rounded w-1/3" />
      </div>
    </div>
  );
}
