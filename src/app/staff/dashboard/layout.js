"use client";

import StaffSidebar from "@/Component/Staff/StaffSidebar";
import { USER_TYPES, verifyAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StaffDashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const { valid, user } = verifyAuth(USER_TYPES.STAFF);
      
      if (!valid) {
        router.push("/staff/signin");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#1d1d24]">
      <StaffSidebar />
      <div className="flex-1 bg-[#1d1d24] p-8">{children}</div>
    </div>
  );
}
