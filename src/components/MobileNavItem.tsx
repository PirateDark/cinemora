import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface MobileNavItemProps {
  to: string;
  icon?: ReactNode;
  label: string;
  onClose: () => void;
  onClick?: () => void;
}

export default function MobileNavItem({ to, icon, label, onClose, onClick }: MobileNavItemProps) {
  const handleClick = () => {
    if (onClick) onClick();
    onClose();
  };
  return (
    <Link
      to={to}
      onClick={handleClick}
      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] active:bg-white/10"
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
