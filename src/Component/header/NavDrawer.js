import Link from "next/link";
import { X } from "lucide-react";

export default function NavDrawer({ open, onClose }) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <span className="font-semibold">Menu</span>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-3">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/" className="nav-link">Home Site</Link>
          <Link href="/calendar" className="nav-link">Calendar</Link>
        </nav>
      </div>
    </>
  );
}
