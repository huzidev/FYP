"use client";

import AdminSidebar from "@/Component/Admin/AdminSidebar";
import StaffSidebar from "@/Component/Staff/StaffSidebar";
import { getCurrentUser, verifyAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentsLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const { valid } = verifyAuth();
      if (!valid) {
        router.push("/");
        return;
      }
      setCurrentUser(getCurrentUser());
    };
    checkAuth();
  }, [router]);

  // Show sidebar only for list page, not for profile/edit pages
  const showSidebar = pathname === "/students";

  if (!mounted) {
    return <div className="min-h-screen bg-[#1d1d24]">{children}</div>;
  }

  if (!showSidebar) {
    return <>{children}</>;
  }

  // Determine which sidebar to show based on user type
  const Sidebar = currentUser?.userType === "admin" ? AdminSidebar : StaffSidebar;

  return (
    <div className="flex min-h-screen bg-[#1d1d24]">
      <Sidebar />
      <div className="flex-1 bg-[#1d1d24]">{children}</div>
    </div>
  );
}
