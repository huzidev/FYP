"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, StudentService } from "../../../lib/api";
import ConfirmModal from "../../Common/ConfirmModal";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });
  const router = useRouter();

  const fetchStudents = async (page = 1, search = "", departmentId = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(departmentId && { departmentId }),
      });

      const response = await StudentService.getAll();
      setStudents(response.data.data || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, searchTerm, selectedDepartment);
  }, [currentPage, searchTerm, selectedDepartment]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (e) => {
    setSelectedDepartment(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    if (!deleteModal.student) return;
    
    try {
      await StudentService.delete(deleteModal.student.id);
      fetchStudents(currentPage, searchTerm, selectedDepartment);
      setDeleteModal({ isOpen: false, student: null });
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-300">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Students List</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={selectedDepartment}
            onChange={handleDepartmentFilter}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {/* You can populate this with actual departments */}
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
              <th className="border border-gray-600 px-4 py-2 text-left">Student ID</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Full Name</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Department</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Level</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-[#2d2d39]">
                  <td className="border border-gray-600 px-4 py-2">{student.studentId}</td>
                  <td className="border border-gray-600 px-4 py-2">{student.fullName}</td>
                  <td className="border border-gray-600 px-4 py-2">{student.email}</td>
                  <td className="border border-gray-600 px-4 py-2">{student.department?.name || 'N/A'}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {student.level}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      student.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/students/profile/${student.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/students/edit/${student.id}`)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, student })}
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#2d2d39] text-white hover:bg-[#3a3a42]'
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

      {loading && students.length > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-400">Updating...</div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteModal.student?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
