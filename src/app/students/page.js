"use client";

import { useState } from "react";
import AddStudentForm from "@/Component/Admin/Common/addUserForm";
import Modal from "@/Component/Common/Modal";
import StudentsTable from "@/Component/Admin/Student/StudentsTable";
import { verifyAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const [isAddUploadOpen, setIsAddUploadOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
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

  const handleClose = () => {
    setIsAddUploadOpen(false);
    setShowSuccess(false);
  };

  const handleSuccess = (data) => {
    setShowSuccess(true);
    // Refresh the table
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateNew = () => {
    setShowSuccess(false);
    // Reset form by incrementing key
    setFormKey(prev => prev + 1);
  };

  return (
    <div className="w-full p-8 space-y-6">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
              <p className="text-gray-400">Manage all students</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddUploadOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                + Create Student
              </button>
            </div>
          </div>

          {/* Modal */}
          <Modal 
            isOpen={isAddUploadOpen} 
            onClose={handleClose} 
            title={showSuccess ? "Student Created Successfully" : "Create Student"}
            size="xl"
          >
            {showSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Student created successfully!
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-[#1e1e26] text-gray-300 rounded-lg hover:bg-[#25252b] transition"
                  >
                    Close Modal
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    Create New Student
                  </button>
                </div>
              </div>
            ) : (
              <AddStudentForm 
                key={formKey}
                userType="student" 
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )}
          </Modal>

          {/* Students Table */}
          <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
            <StudentsTable key={refreshKey} />
          </div>
        </div>
    </div>
  );
}
