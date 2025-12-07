"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, StaffService } from "../../../lib/api";
import ConfirmModal from "../../Common/ConfirmModal";

export default function StaffTable() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, member: null });
  const router = useRouter();

  const fetchStaff = async (page = 1, search = "", role = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(role && { role }),
      });

      const response = await StaffService.getAll();
      setStaff(response.data.data || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch staff");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(currentPage, searchTerm, selectedRole);
  }, [currentPage, searchTerm, selectedRole]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    if (!deleteModal.member) return;
    
    try {
      await StaffService.delete(deleteModal.member.id);
      fetchStaff(currentPage, searchTerm, selectedRole);
      setDeleteModal({ isOpen: false, member: null });
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff member");
    }
  };

  if (loading && staff.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-300">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Staff List</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={selectedRole}
            onChange={handleRoleFilter}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="ADMISSION">Admission</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-600 bg-[#1e1e26] shadow-md rounded-lg text-white">
          <thead className="bg-[#25252b]">
            <tr>
              <th className="border border-gray-600 px-4 py-2 text-left">Staff ID</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Full Name</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Phone</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No staff found
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-[#2d2d39]">
                  <td className="border border-gray-600 px-4 py-2">{member.staffId}</td>
                  <td className="border border-gray-600 px-4 py-2">{member.fullName}</td>
                  <td className="border border-gray-600 px-4 py-2">{member.email}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {member.role}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">{member.phone || 'N/A'}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        member.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/staff/profile/${member.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/staff/edit/${member.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, member })}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-[#2d2d39] text-white rounded hover:bg-[#3a3a42] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-[#2d2d39] text-white hover:bg-[#3a3a42]"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 bg-[#2d2d39] text-white rounded hover:bg-[#3a3a42] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {loading && staff.length > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-400">Updating...</div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, member: null })}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${deleteModal.member?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
