"use client";

import AddUserForm from "@/Component/Admin/Common/addUserForm";
import AdminsTable from "@/Component/Admin/Admin/AdminsTable";
import Modal from "@/Component/Common/Modal";
import { getCurrentUser } from "@/lib/auth";
import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AdminsPage() {
  const tableRef = useRef(null);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Only show Create Admin button if current user is SUPER_ADMIN
  const canCreateAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleClose = () => {
    setIsCreateAdminOpen(false);
  };

  const handleSuccess = (data) => {
    toast.success("Admin created successfully!");
    setRefreshKey(prev => prev + 1);
    handleClose();
  };

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
          {canCreateAdmin && (
            <button
              onClick={() => setIsCreateAdminOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              + Create Admin
            </button>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      <Modal
        isOpen={isCreateAdminOpen}
        onClose={handleClose}
        title="Create Admin"
        size="xl"
      >
        <AddUserForm
          key={formKey}
          userType="admin"
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>

      {/* Admins Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <AdminsTable ref={tableRef} key={refreshKey} />
      </div>
    </div>
  );
}
