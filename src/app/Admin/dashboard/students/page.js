"use client";

import ActionButtons from "@/Component/Admin/Common/Buttons/actionButtons";
import AddStudentForm from "@/Component/Admin/Common/addUserForm";
import BulkFileUpload from "@/Component/Admin/Common/bulkFileUpload";
import Modal from "@/Component/Admin/Common/modal";
import StudentsTable from "@/Component/Admin/Student/StudentsTable";
import { useState } from "react";

export default function StudentsPage() {
  const [isAddUploadOpen, setIsAddUploadOpen] = useState(false);
  const [isBulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

  const handleClose = () => {
    setIsAddUploadOpen(false);
    setBulkUploadOpen(false);
    setIsBulkUpdateOpen(false);
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
        <div className="flex gap-3">
          <ActionButtons
            onAdd={() => setIsAddUploadOpen(true)}
            onBulkUpload={() => setBulkUploadOpen(true)}
            onBulkUpdate={() => setIsBulkUpdateOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isAddUploadOpen} onClose={handleClose} title="Add Student">
        <AddStudentForm />
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
        <StudentsTable />
      </div>
    </div>
  );
}
