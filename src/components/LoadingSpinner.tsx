export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-24 gap-3">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-500 text-sm font-medium">جاري التحميل...</p>
    </div>
  );
}
