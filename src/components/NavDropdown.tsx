import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface NavDropdownProps {
  label: string;
  items: { name: string; path: string }[];
}

export default function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
          open ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-52 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/50 border border-gray-700/50 py-1.5 z-50 origin-top-right animate-fadeIn overflow-hidden">
          {items.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
