import { Heart } from "lucide-react";

interface Props {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon || <Heart className="w-16 h-16 text-gray-600 mb-4" />}
      <h3 className="text-xl font-bold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
