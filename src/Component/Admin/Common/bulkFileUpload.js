"use client";
import { useRef } from "react";
import Papa from "papaparse";

export default function BulkFileUpload({ mode, onSubmit }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("papa parsing the file (data)")
    Papa.parse(file, {
      header: true, // first row as headers
      skipEmptyLines: true,
      complete: (results) => {

        // 1. Expected headers (required feilds)
        const requiredHeaders = ["name", "email", "phoneNumber"];

        // 2. Actual headers from PapaParse
        const actualHeaders = results.meta.fields; // Papa gives you header row here

        // 3. Check if all required headers exist
        const isValid = requiredHeaders.every((h) => actualHeaders.includes(h));

        if (!isValid) {
          alert(
            `Invalid CSV file! Required headers: ${requiredHeaders.join(", ")}`
          );
          return;
        }

        // 4. If valid, send data to parent file
        if (onSubmit) {
          onSubmit(results.data, mode); // send(all parsed data in array , mode)
        }
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
      },
    });
  };

  return (
    <div
      className="w-auto h-40 flex flex-col items-center justify-center
                 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer
                 hover:border-blue-500 hover:bg-gray-50 p-6"
      onClick={handleClick}
    >
      <p className="text-gray-700 text-lg font-medium mb-2">
        Drop your CSV file here
      </p>
      ``
      <p className="text-gray-500 text-sm">or click anywhere to select file</p>
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
