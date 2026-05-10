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
    <div className={`${className} flex items-center transition-all duration-200 px-3 py-1.5`}>
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
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
