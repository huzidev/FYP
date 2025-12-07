"use client";

import AdminsTable from "@/Component/Admin/Admin/AdminsTable";

export default function AdminsPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admins</h1>
          <p className="text-gray-400">Manage all administrators</p>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <AdminsTable />
      </div>
    </div>
  );
}
