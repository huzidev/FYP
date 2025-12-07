"use client";

import StaffTable from "@/Component/Admin/Staff/StaffTable";

export default function StaffPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff</h1>
          <p className="text-gray-400">Manage all staff members</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
            + Add Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <StaffTable />
      </div>
    </div>
  );
}
