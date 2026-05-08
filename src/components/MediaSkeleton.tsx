export default function MediaSkeleton() {
  return (
    <div className="animate-pulse bg-gray-800 rounded-xl overflow-hidden aspect-[2/3] relative">
      <div className="absolute inset-0 bg-gray-700"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
  );
}
