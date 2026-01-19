"use client";

import AdminsTable from "@/Component/Admin/Admin/AdminsTable";
import { useRef } from "react";

export default function AdminsPage() {
  const tableRef = useRef(null);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admins</h1>
          <p className="text-gray-400">Manage all administrators</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => tableRef.current?.downloadCurrentPage()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <span>
              <img src="/icon/download-icon.svg" alt="Download" className="w-4 h-4 mr-2 inline-block filter invert brightness-0" />
              Download List
            </span>
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <AdminsTable ref={tableRef} />
      </div>
    </div>
  );
}
