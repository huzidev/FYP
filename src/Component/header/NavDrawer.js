"use client";

import { useState } from "react";
import {
  X,
  Home,
  Bell,
  Calendar,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Settings,
  Bookmark, // instead of BookMarked
  FileText,
  ClipboardList,
  CheckCircle,
  Layers,
} from "lucide-react";

import Link from "next/link";

export default function NavDrawer({ open, onClose }) {
  // Use object to track multiple menus independently
  const [openMenus, setOpenMenus] = useState({
    finance: false,
    admin: false,
    academic: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu], // toggle current menu
    }));
  };

  const SubLink = ({ href, icon: Icon, label }) => (
    <Link
      href={href}
      className="flex items-center gap-2 pl-1 py-1 rounded-lg hover:bg-[#35353d] text-sm text-gray-300"
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 md:w-72 bg-[#2b2b33] z-30
      transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#35353d]">
        <span className="font-semibold text-white">Menu</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col p-4 gap-1 text-white">
        {/* Dashboard */}
        <Link
          href="/student/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d]"
        >
          <Home size={18} />
          Dashboard
        </Link>

        {/* Announcements */}
        <Link
          href="/student/announcements"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#35353d]"
        >
          <Bell size={18} />
          Announcements
        </Link>

        {/* ================= FINANCE ================= */}
        <button
          onClick={() => toggleMenu("finance")}
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#35353d]"
        >
          <div className="flex items-center gap-3">
            <DollarSign size={18} />
            Finance
          </div>
          {openMenus.finance ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        {openMenus.finance && (
          <div className="ml-8 flex flex-col gap-1">
            <SubLink
              href="/student/dashboard/finance/installment"
              icon={FileText}
              label="Installment Fee Voucher"
            />
            <SubLink
              href="/student/dashboard/finance/generate-fee"
              icon={FileText}
              label="Generate Fee Voucher"
            />
            <SubLink
              href="/student/dashboard/finance/student-fee"
              icon={CheckCircle}
              label="Student Fee Status"
            />
          </div>
        )}

        {/* ================= ADMIN / SCHEDULE ================= */}
        <button
          onClick={() => toggleMenu("admin")}
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#35353d]"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            Admin / Schedule
          </div>
          {openMenus.admin ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        {openMenus.admin && (
          <div className="ml-8 flex flex-col gap-1">
            <SubLink
              href="/student/dashboard/enrollment/Self-Registration"
              icon={ClipboardList}
              label="Self Registration"
            />
            <SubLink
              href="/student/dashboard/academic/class-schedule"
              icon={Layers}
              label="Class Schedule"
            />
            <SubLink
              href="/student/dashboard/academic/exam-schedule"
              icon={BookOpen}
              label="Exam Schedule"
            />
          </div>
        )}

        {/* ================= ACADEMIC ================= */}
        <button
          onClick={() => toggleMenu("academic")}
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#35353d]"
        >
          <div className="flex items-center gap-3">
            <Bookmark size={18} />
            Academic
          </div>
          {openMenus.academic ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        {openMenus.academic && (
          <div className="ml-8 flex flex-col gap-1">
            <SubLink
              href="/student/dashboard/academic/current-course"
              icon={BookOpen}
              label="Current Courses"
            />
            <SubLink
              href="/student/dashboard/academic/transcript"
              icon={GraduationCap}
              label="Transcript"
            />
          </div>
        )}

        <div className="border-t border-[#35353d] my-2"></div>

        {/* Home Site */}
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
