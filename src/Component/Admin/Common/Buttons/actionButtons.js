"use client";

export default function ActionButtons({ onAdd, onBulkUpload, onBulkUpdate }) {
  return (
    <div className="flex gap-3 mb-6">
      {/* Add User */}
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        + Add User
      </button>

      {/* Bulk Upload */}
      <button
        onClick={onBulkUpload}
        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        Bulk Upload
      </button>

      {/* Bulk Update */}
      <button
        onClick={onBulkUpdate}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
      >
        Bulk Update
      </button>
    </div>
  );
}
