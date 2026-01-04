import { Menu } from "lucide-react";

export default function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-black/5 transition md:hidden"
      aria-label="Open Menu"
    >
      <Menu size={22} />
    </button>
  );
}
