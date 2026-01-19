"use client";

import AdminSidebar from "@/Component/Admin/AdminSidebar";
import { USER_TYPES, verifyAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const { valid, user } = verifyAuth();
      if (!valid) {
        router.push("/");
        return;
      }
      // Only admin can access staff list
      if (user?.userType !== USER_TYPES.ADMIN) {
        router.push("/");
        return;
      }
    };
    checkAuth();
  }, [router]);

  // Show sidebar only for list page, not for profile/edit pages
  const showSidebar = pathname === "/staff";

  if (!mounted) {
    return <div className="min-h-screen bg-[#1d1d24]">{children}</div>;
  }

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#1d1d24]">
      <AdminSidebar />
      <div className="flex-1 bg-[#1d1d24]">{children}</div>
    </div>
  );
}
