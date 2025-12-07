"use client";

import StaffTable from "@/Component/Admin/Staff/StaffTable";
import { verifyAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const { valid } = verifyAuth();
      if (!valid) {
        router.push("/");
        return;
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="w-full p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Staff</h1>
              <p className="text-gray-400">Manage all staff members</p>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
            <StaffTable />
          </div>
    </div>
  );
}
