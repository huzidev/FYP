"use client";

import { logout, getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const StaffSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role) {
      setUserRole(user.role);
    }
  }, []);

  // Common menu items for all staff
  const commonItems = [
    { name: "Dashboard", path: "/staff/dashboard", icon: "📊" },
    { name: "Announcements", path: "/staff/dashboard/announcements", icon: "📢" },
  ];

  // Teacher-specific menu items
  const teacherItems = [
    { name: "My Courses", path: "/staff/dashboard/my-courses", icon: "📚" },
  ];

  // Admission staff-specific menu items
  const admissionItems = [
    { name: "Students", path: "/staff/dashboard/students", icon: "👥" },
    { name: "Teacher Assignments", path: "/staff/dashboard/teacher-assignments", icon: "👨‍🏫" },
  ];

  // Combine menu items based on role
  const getMenuItems = () => {
    const items = [...commonItems];

    if (userRole === "TEACHER") {
      items.splice(1, 0, ...teacherItems); // Insert after Dashboard
    } else if (userRole === "ADMISSION") {
      items.splice(1, 0, ...admissionItems);
    } else {
      // If role not determined yet, show all items
      items.splice(1, 0, ...teacherItems, ...admissionItems);
    }

    return items;
  };

  const pageItems = getMenuItems();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActivePath = (path) => {
    if (path === "/staff/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-64 bg-[#1d1d24] text-white flex flex-col shadow-lg border-r border-[#25252b]">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-[#25252b]">
        <h1 className="text-2xl font-bold text-indigo-400">
          {userRole === "TEACHER" ? "Teacher Panel" : userRole === "ADMISSION" ? "Admission Panel" : "Staff Panel"}
        </h1>
      </div>

      {/* Role Badge */}
      {userRole && (
        <div className="px-5 py-3 border-b border-[#25252b]">
          <span className={`text-xs px-2 py-1 rounded-full ${
            userRole === "TEACHER" ? "bg-indigo-600" : "bg-green-600"
          }`}>
            {userRole}
          </span>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
        {pageItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition ${
              isActivePath(item.path)
                ? "bg-indigo-600 text-white"
                : "hover:bg-[#2d2d39] text-gray-300"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-5 border-t border-[#25252b]">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition text-center flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;
