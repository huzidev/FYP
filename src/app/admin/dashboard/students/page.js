"use client";

import AddStudentForm from "@/Component/Admin/Common/addUserForm";
import BulkFileUpload from "@/Component/Admin/Common/bulkFileUpload";
import StudentsTable from "@/Component/Admin/Student/StudentsTable";
import Modal from "@/Component/Common/Modal";
import { StudentService, ApiResponse } from "@/lib/api";
import { useState, useRef } from "react";

// Component to display bulk operation results
function BulkResultDisplay({ result, operationType, onClose }) {
  if (!result.success) {
    // Error state - show user-friendly error message
    return (
      <div className="space-y-4">
        <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded">
          {result.error}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Success state - use formatted results
  const { formatted } = result;
  const hasErrors = formatted?.errors?.length > 0;
  const allFailed = formatted?.successful === 0 && formatted?.failed > 0;

  return (
    <div className="space-y-4">
      {/* Status message */}
      <div className={`px-4 py-3 rounded border ${
        allFailed
          ? 'bg-red-900/30 border-red-600 text-red-400'
          : 'bg-green-900/30 border-green-600 text-green-400'
      }`}>
        {allFailed
          ? `Bulk ${operationType} failed. No records were processed.`
          : `Bulk ${operationType} completed!`
        }
      </div>

      {/* Stats */}
      <div className="text-gray-300 space-y-2">
        <p>Total: {formatted?.total || 0}</p>
        <p className="text-green-400">Successful: {formatted?.successful || 0}</p>
        {formatted?.failed > 0 && (
          <p className="text-red-400">Failed: {formatted?.failed || 0}</p>
        )}
      </div>

      {/* Error details */}
      {hasErrors && (
        <div className="mt-4 max-h-40 overflow-y-auto bg-[#1e1e26] rounded p-3">
          <p className="text-red-400 font-medium mb-2">Errors:</p>
          {formatted.errors.map((err, idx) => (
            <p key={idx} className="text-sm text-gray-400 py-1 border-b border-gray-700 last:border-0">
              Row {err.row}: {err.message}
            </p>
          ))}
        </div>
      )}

      {/* Close button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [isAddUploadOpen, setIsAddUploadOpen] = useState(false);
  const [isBulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const tableRef = useRef(null);

  // Bulk operation states
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const handleClose = () => {
    setIsAddUploadOpen(false);
    setBulkUploadOpen(false);
    setIsBulkUpdateOpen(false);
    setShowSuccess(false);
    setBulkResult(null);
  };

  const handleSuccess = (data) => {
    setShowSuccess(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateNew = () => {
    setShowSuccess(false);
    setFormKey(prev => prev + 1);
  };

  const handleBulkSubmit = async (file, mode) => {
    setBulkLoading(true);
    setBulkResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let response;
      if (mode === "upload") {
        response = await StudentService.bulkUpload(formData);
      } else {
        response = await StudentService.bulkUpdate(formData);
      }

      // Format results using ApiResponse utility
      const formattedResults = ApiResponse.formatBulkResults(response.data);

      setBulkResult({
        success: true,
        data: response.data,
        formatted: formattedResults,
      });

      // Only refresh if there were successful operations
      if (formattedResults?.successful > 0) {
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      // Use ApiResponse to get user-friendly error message
      setBulkResult({
        success: false,
        error: ApiResponse.getErrorMessage(error),
      });
    } finally {
      setBulkLoading(false);
    }
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
        title="Bulk Upload Students"
      >
        {bulkLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-400">Uploading students...</p>
          </div>
        ) : bulkResult ? (
          <BulkResultDisplay
            result={bulkResult}
            operationType="upload"
            onClose={handleClose}
          />
        ) : (
          <BulkFileUpload
            mode="upload"
            onSubmit={(file) => handleBulkSubmit(file, "upload")}
          />
        )}
      </Modal>

      <Modal
        isOpen={isBulkUpdateOpen}
        onClose={handleClose}
        title="Bulk Update Students"
      >
        {bulkLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-gray-400">Updating students...</p>
          </div>
        ) : bulkResult ? (
          <BulkResultDisplay
            result={bulkResult}
            operationType="update"
            onClose={handleClose}
          />
        ) : (
          <BulkFileUpload
            mode="update"
            onSubmit={(file) => handleBulkSubmit(file, "update")}
          />
        )}
      </Modal>

      {/* Students Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <StudentsTable ref={tableRef} key={refreshKey} />
      </div>
    </div>
  );
}
