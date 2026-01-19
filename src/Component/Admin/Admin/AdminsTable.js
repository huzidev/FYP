"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { AdminService, ApiError } from "../../../lib/api";
import { getCurrentUser } from "../../../lib/auth";

// Helper function to escape CSV fields
function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const AdminsTable = forwardRef(function AdminsTable(props, ref) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const router = useRouter();
  const currentUser = getCurrentUser();

  const fetchAdmins = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await AdminService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });
      setAdmins(response.data.data || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error("Error fetching admins:", err);
      if (err instanceof ApiError) {
        setError(err.getUserMessage ? err.getUserMessage() : err.message);
      } else {
        setError("Failed to fetch admins");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const canEdit = (admin) => {
    if (!currentUser) return false;
    if (admin.role === "SUPER_ADMIN") return false;
    if (admin.id === currentUser.id) return false;
    return currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";
  };

  // Download current page admins as CSV
  const downloadCurrentPage = () => {
    if (admins.length === 0) {
      alert('No admins to download');
      return;
    }

    const headers = ['ID', 'Full Name', 'Email', 'Role', 'Phone', 'Status'];
    const csvRows = [headers.join(',')];

    for (const admin of admins) {
      const row = [
        admin.id,
        escapeCsvField(admin.fullName),
        escapeCsvField(admin.email),
        escapeCsvField(admin.role),
        escapeCsvField(admin.phone || ''),
        admin.isActive ? 'Active' : 'Inactive',
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admins_page${currentPage}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    downloadCurrentPage,
    getAdminsCount: () => admins.length,
  }));

  if (loading && admins.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-300">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Admins List</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
              <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Full Name</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Phone</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No admins found
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-[#2d2d39]">
                  <td className="border border-gray-600 px-4 py-2">{admin.id}</td>
                  <td className="border border-gray-600 px-4 py-2">{admin.fullName}</td>
                  <td className="border border-gray-600 px-4 py-2">{admin.email}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {admin.role}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">{admin.phone || 'N/A'}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex space-x-2">
                      {admin.id === currentUser?.id ? (
                        <button
                          onClick={() => router.push(`/admins/profile/${admin.id}`)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          View Profile
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/admins/profile/${admin.id}`)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            View
                          </button>
                          {canEdit(admin) && (
                            <button
                              onClick={() => router.push(`/admins/edit/${admin.id}`)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
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
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-[#2d2d39] text-white rounded hover:bg-[#3a3a42] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
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
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 bg-[#2d2d39] text-white rounded hover:bg-[#3a3a42] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {loading && admins.length > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-400">Updating...</div>
        </div>
      )}
    </div>
  );
});

export default AdminsTable;
