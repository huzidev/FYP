"use client";

import { logout } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const pageItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Students", path: "/admin/dashboard/students" },
    { name: "Staff", path: "/admin/dashboard/staff" },
    { name: "Admins", path: "/admin/dashboard/admins" },
    { name: "Courses", path: "/admin/dashboard/courses" },
    { name: "Announcements", path: "/admin/dashboard/announcements" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="h-screen w-64 bg-[#1d1d24] text-white flex flex-col shadow-lg border-r border-[#25252b]">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-[#25252b]">
        <h1 className="text-2xl font-bold text-indigo-400">Admin Panel</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-5 space-y-2">
        {pageItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block w-full py-3 px-4 rounded-lg transition ${
              pathname === item.path
                ? "bg-indigo-600 text-white"
                : "hover:bg-[#2d2d39] text-gray-300"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-5 border-t border-[#25252b]">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition text-center"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
