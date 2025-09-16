"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const pageItems = [
    { name: "Dashboard", path: "/Admin/AdminPage/Dashboard" },
    { name: "Students", path: "/Admin/AdminPage/Students" },
    { name: "Teachers", path: "/Admin/AdminPage/Teachers" },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-5 space-y-4">
        {pageItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block w-full py-2 px-4 rounded-lg transition ${
              pathname === item.path ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
