import { X, Home, Bell, Calendar, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";

export default function NavDrawer({ open, onClose }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 md:w-72 bg-[#2b2b33] z-30
      transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#35353d]">
        <span className="font-semibold text-white">Menu</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col p-4 gap-1 text-white">
        <Link
          href="/student/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d] transition"
        >
          <Home size={18} />
          Dashboard
        </Link>
        <Link
          href="/student/dashboard/transcript"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d] transition"
        >
          <GraduationCap size={18} />
          Transcript
        </Link>
        <Link
          href="/student/announcements"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d] transition"
        >
          <Bell size={18} />
          Announcements
        </Link>
        <Link
          href="/calendar"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d] transition"
        >
          <Calendar size={18} />
          Calendar
        </Link>
        <div className="border-t border-[#35353d] my-2"></div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d] transition text-gray-400"
        >
          <BookOpen size={18} />
          Home Site
        </Link>
      </nav>
    </div>
  );
}
