export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-red-400 text-lg">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-700 transition"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}