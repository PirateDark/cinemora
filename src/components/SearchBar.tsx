import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, onKeyDown, placeholder = "بحث...", className = "" }: SearchBarProps) {
  return (
    <div className={`flex items-center bg-gray-800/70 hover:bg-gray-700/70 focus-within:bg-gray-700/70 focus-within:ring-1 focus-within:ring-rose-500/50 rounded-xl px-3 py-1.5 transition-all duration-200 border border-gray-700/30 ${className}`}>
      <Search className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="bg-transparent outline-none px-2 text-sm w-full text-white placeholder-gray-500"
      />
    </div>
  );
}
