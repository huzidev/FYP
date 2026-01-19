import Link from "next/link";
import { X } from "lucide-react";

export default function NavDrawer({ open, onClose }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 md:w-72 bg-[#2b2b33] z-30
      transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <span className="font-semibold text-white">Menu</span>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col p-4 gap-3 text-white">
        <Link href="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link href="/" className="nav-link">
          Home Site
        </Link>
        <Link href="/calendar" className="nav-link">
          Calendar
        </Link>
      </nav>
    </div>
  );
}
