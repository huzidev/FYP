"use client";

import TopBar from "@/Component/Admin/TopBar/topbar"; // we'll create this next
// import StudentsTable from "@/Component/Admin/Student/studentsTable";
import ActionButtons from "@/Component/Admin/Common/Buttons/actionButtons";
import AddStudentForm from "@/Component/Admin/Common/addUserForm";
import BulkFileUpload from "@/Component/Admin/Common/bulkFileUpload";
import Modal from "@/Component/Admin/Common/modal";
import { useState } from "react";

export default function StudentsPage() {
  const [isAddUploadOpen, setisAddUploadOpen] = useState(false);
  const [isBulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [isBulkUpdateOpen, setisBulkUpdateOpen] = useState(false);

  const handleClose = () => {
    setisAddUploadOpen(false);
    setBulkUploadOpen(false);
    setisBulkUpdateOpen(false);
  };
  const handleBulkSubmit = (file, mode) => {
    console.log("handle submit fx calling in student page");
    console.log("file data in array ", file, "mode",mode);

    // TODO:
    file.map((item)=>{
      console.log("see item",item)
      //calling api
    })


  };

  return (
    <div className="w-full">
      {/* Top Bar */}
      <TopBar title="Students" />

      <ActionButtons
        onAdd={() => {
          setisAddUploadOpen(true);
        }}
        onBulkUpload={() => {
          setBulkUploadOpen(true);
        }}
        onBulkUpdate={() => {
          setisBulkUpdateOpen(true);
        }}
      />

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

      {/* Content */}
      {/* <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Students List</h2>
        <StudentsTable />
      </div> */}
    </div>
  );
}
