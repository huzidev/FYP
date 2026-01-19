"use client";
import { useRef } from "react";

export default function BulkFileUpload({ onSubmit }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    // Send raw file to parent - backend will handle parsing
    if (onSubmit) {
      onSubmit(file);
    }
  };

  return (
    <div
      className="w-auto h-40 flex flex-col items-center justify-center
                 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer
                 hover:border-blue-500 hover:bg-gray-50 p-6"
      onClick={handleClick}
    >
      <p className="text-gray-700 text-lg font-medium mb-2">
        Click to select CSV file
      </p>
      <p className="text-gray-500 text-sm">Supported format: .csv</p>
      <p className="text-gray-400 text-xs mt-2">
        Required: fullName, email, studentId, level, departmentId
      </p>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
