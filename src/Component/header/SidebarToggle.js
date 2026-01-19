import { Menu } from "lucide-react";

export default function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-white/10 transition"
      aria-label="Open Menu"
    >
      <Menu size={22} />
    </button>
  );
}
