"use client";

import AddStudentForm from "@/Component/Admin/Common/addUserForm";
import BulkFileUpload from "@/Component/Admin/Common/bulkFileUpload";
import StudentsTable from "@/Component/Admin/Student/StudentsTable";
import Modal from "@/Component/Common/Modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentsPage() {
  const [isAddUploadOpen, setIsAddUploadOpen] = useState(false);
  const [isBulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  const handleClose = () => {
    setIsAddUploadOpen(false);
    setBulkUploadOpen(false);
    setIsBulkUpdateOpen(false);
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

  const handleBulkSubmit = (file, mode) => {
    console.log("handle submit fx calling in student page");
    console.log("file data in array ", file, "mode", mode);

    // TODO: Implement bulk upload/update
    file.map((item) => {
      console.log("see item", item);
      // calling api
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
          <p className="text-gray-400">Manage all students</p>
        </div>
        <div className="flex gap-8">
          <button
            onClick={() => setIsBulkUpdateOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <span >
              <img src="/icon/upload-icon.svg" alt="Download" className="w-4 h-4 mr-2 inline-block filter invert brightness-0" />
              Bulk Update

            </span>
          </button>
          <button
            onClick={() => setBulkUploadOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <span className="text-white">
              <img src="/icon/upload-icon.svg" alt="Download" className="w-4 h-4 mr-2 inline-block filter invert brightness-0" />
              Bulk Upload
            </span>
          </button>

          {/* //TODO: need to develop :: download all students list with paginated items  */}
          <button
            onClick={() => setIsDownloadOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <span >
              <img src="/icon/download-icon.svg" alt="Download" className="w-4 h-4 mr-2 inline-block filter invert brightness-0" />
              Download List
            </span>
          </button>
          <button
            onClick={() => setIsAddUploadOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            + Create Student

          </button>
        </div>
      </div>

      {/* Modals */}
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

      <Modal
        isOpen={isBulkUploadOpen}
        onClose={handleClose}
        title="Upload File for Bulk Upload"
      >
        <BulkFileUpload
          mode="upload"
          onSubmit={(file) => handleBulkSubmit(file, "upload")}
        />
      </Modal>

      <Modal
        isOpen={isBulkUpdateOpen}
        onClose={handleClose}
        title="Upload File for Bulk Update"
      >
        <BulkFileUpload
          mode="update"
          onSubmit={(file) => handleBulkSubmit(file, "update")}
        />
      </Modal>

      {/* Students Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <StudentsTable key={refreshKey} />
      </div>
    </div>
  );
}
