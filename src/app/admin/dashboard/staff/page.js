"use client";

import AddUserForm from "@/Component/Admin/Common/addUserForm";
import StaffTable from "@/Component/Admin/Staff/StaffTable";
import Modal from "@/Component/Common/Modal";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

export default function StaffPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const tableRef = useRef(null);

  const handleClose = () => {
    setIsAddModalOpen(false);
  };

  const handleSuccess = (data) => {
    toast.success("Staff member created successfully!");
    setRefreshKey(prev => prev + 1);
    handleClose();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff</h1>
          <p className="text-gray-400">Manage all staff members</p>
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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleClose}
        title="Create Staff Member"
        size="xl"
      >
        <AddUserForm
          key={formKey}
          userType="staff"
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>

      {/* Staff Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <StaffTable ref={tableRef} key={refreshKey} />
      </div>
    </div>
  );
}
