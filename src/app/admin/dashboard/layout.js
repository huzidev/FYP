"use client";

import AdminSidebar from "@/Component/Admin/AdminSidebar";
import { USER_TYPES, verifyAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const { valid, user } = verifyAuth(USER_TYPES.ADMIN);
      
      if (!valid) {
        router.push("/admin/signin");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#1d1d24]">
      <AdminSidebar />
      <main className="flex-1 bg-[#1d1d24] px-8 pb-8 pt-6">
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
