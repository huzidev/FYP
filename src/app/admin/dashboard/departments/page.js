"use client";

import ConfirmModal from "@/Component/Common/ConfirmModal";
import Modal from "@/Component/Common/Modal";
import { ApiResponse, DepartmentService } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiEdit2,
    FiEye,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiToggleLeft,
    FiToggleRight,
    FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  level: "BACHELOR",
  isActive: true,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedDept, setSelectedDept] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState(emptyForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);

  const getFilters = () => ({
    search: searchTerm.trim() || undefined,
    isActive:
      statusFilter === "all"
        ? undefined
        : statusFilter === "active"
          ? true
          : false,
  });

  const fetchDepartments = useCallback(async (filters = {}) => {
    try {
      setListLoading(true);
      setListError(null);
      const response = await DepartmentService.getAll(filters);
      setDepartments(response.data?.data || []);
    } catch (error) {
      setListError(ApiResponse.getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchDepartmentDetails = useCallback(async (deptId) => {
    if (!deptId) return;
    try {
      setDetailLoading(true);
      setDetailError(null);
      const response = await DepartmentService.getById(deptId);
      setSelectedDept(response.data?.data || null);
    } catch (error) {
      setDetailError(ApiResponse.getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments(getFilters());
  }, [statusFilter, fetchDepartments]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchDepartments(getFilters());
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchDepartments({});
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateOpen(true);
  };

  const openEditModal = (dept) => {
    setEditTarget(dept);
    setFormData({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
      level: dept.level || "BACHELOR",
      isActive: typeof dept.isActive === "boolean" ? dept.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    setSubmitting(true);
    try {
      await DepartmentService.create({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        level: formData.level,
        isActive: formData.isActive,
      });
      toast.success("Department created");
      setIsCreateOpen(false);
      setFormData(emptyForm);
      fetchDepartments(getFilters());
    } catch (error) {
      toast.error(ApiResponse.getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editTarget) return;
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    setSubmitting(true);
    try {
      await DepartmentService.update(editTarget.id, {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        level: formData.level,
        isActive: formData.isActive,
      });
      toast.success("Department updated");
      setIsEditOpen(false);
      setEditTarget(null);
      fetchDepartments(getFilters());
      setSelectedDept((prev) =>
        prev && prev.id === editTarget.id
          ? { ...prev, ...formData }
          : prev
      );
    } catch (error) {
      toast.error(ApiResponse.getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await DepartmentService.delete(pendingDelete.id);
      toast.success("Department removed");
      if (selectedDept?.id === pendingDelete.id) {
        setSelectedDept(null);
      }
      fetchDepartments(getFilters());
    } catch (error) {
      toast.error(ApiResponse.getErrorMessage(error));
    } finally {
      setPendingDelete(null);
    }
  };

  const toggleActive = async (dept) => {
    try {
      await DepartmentService.update(dept.id, { isActive: !dept.isActive });
      toast.success(
        !dept.isActive ? "Department activated" : "Department deactivated"
      );
      fetchDepartments(getFilters());
      setSelectedDept((prev) =>
        prev && prev.id === dept.id ? { ...prev, isActive: !dept.isActive } : prev
      );
    } catch (error) {
      toast.error(ApiResponse.getErrorMessage(error));
    }
  };

  const rows = useMemo(() => departments || [], [departments]);

  const renderStatusBadge = (isActive) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-green-600/20 text-green-400 border border-green-600/40"
          : "bg-red-600/20 text-red-400 border border-red-600/40"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Departments</h1>
          <p className="text-gray-400">Manage department profiles, visibility, and metadata</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#2d2d39] hover:bg-[#25252b] text-gray-200 rounded-lg border border-[#353542] transition flex items-center gap-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            New Department
          </button>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#2d2d39] rounded-xl p-4 border border-[#25252b]"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or code"
              className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 pl-10 pr-4 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-300 w-28">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex md:justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <FiSearch className="h-4 w-4" />
            Apply
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Departments Table */}
        <div className="xl:col-span-2 bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Departments</h2>
            <span className="text-sm text-gray-400">{rows.length} total</span>
          </div>

          {listError && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
              {listError}
            </div>
          )}

          {listLoading ? (
            <div className="text-center py-10 text-gray-400">Loading departments...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No departments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-[#353542] bg-[#1e1e26] text-white rounded-lg">
                <thead className="bg-[#25252b]">
                  <tr>
                    <th className="border border-[#353542] px-4 py-3 text-left">Name</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Code</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Level</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Status</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Students</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Subjects</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Updated</th>
                    <th className="border border-[#353542] px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((dept) => (
                    <tr
                      key={dept.id}
                      className={`hover:bg-[#2d2d39] ${
                        selectedDept?.id === dept.id ? "bg-[#262633]" : ""
                      }`}
                    >
                      <td className="border border-[#353542] px-4 py-3 font-semibold">{dept.name}</td>
                      <td className="border border-[#353542] px-4 py-3 text-gray-300">{dept.code}</td>
                      <td className="border border-[#353542] px-4 py-3 text-gray-300">{dept.level}</td>
                      <td className="border border-[#353542] px-4 py-3">{renderStatusBadge(dept.isActive)}</td>
                      <td className="border border-[#353542] px-4 py-3 text-gray-300">{dept._count?.students ?? "-"}</td>
                      <td className="border border-[#353542] px-4 py-3 text-gray-300">{dept._count?.subjects ?? "-"}</td>
                      <td className="border border-[#353542] px-4 py-3 text-gray-300">
                        {dept.updatedAt ? new Date(dept.updatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="border border-[#353542] px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => fetchDepartmentDetails(dept.id)}
                            className="px-2 py-1 bg-[#25252b] hover:bg-[#303040] rounded-md text-indigo-400 flex items-center gap-1"
                          >
                            <FiEye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(dept)}
                            className="px-2 py-1 bg-[#25252b] hover:bg-[#303040] rounded-md text-blue-400 flex items-center gap-1"
                          >
                            <FiEdit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(dept)}
                            className="px-2 py-1 bg-[#25252b] hover:bg-[#303040] rounded-md text-yellow-400 flex items-center gap-1"
                          >
                            {dept.isActive ? (
                              <>
                                <FiToggleLeft className="h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <FiToggleRight className="h-4 w-4" />
                                Enable
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setPendingDelete(dept)}
                            className="px-2 py-1 bg-[#2a1f24] hover:bg-[#301c24] rounded-md text-red-400 flex items-center gap-1"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Department Details</h2>
            {selectedDept && (
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(selectedDept)}
                  className="px-3 py-2 bg-[#25252b] hover:bg-[#303040] text-blue-400 rounded-md flex items-center gap-2"
                >
                  <FiEdit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(selectedDept)}
                  className="px-3 py-2 bg-[#2a1f24] hover:bg-[#301c24] text-red-400 rounded-md flex items-center gap-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            )}
          </div>

          {detailLoading ? (
            <div className="text-center py-10 text-gray-400">Loading details...</div>
          ) : detailError ? (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded">
              {detailError}
            </div>
          ) : !selectedDept ? (
            <div className="text-center py-10 text-gray-400">Select a department to view details</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Department Name</p>
                  <h3 className="text-2xl font-bold text-white">{selectedDept.name}</h3>
                  <p className="text-gray-400 mt-1">Code: {selectedDept.code}</p>
                </div>
                {renderStatusBadge(selectedDept.isActive)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Level</p>
                  <p className="text-white font-semibold">{selectedDept.level}</p>
                </div>
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Created</p>
                  <p className="text-white font-semibold">
                    {selectedDept.createdAt
                      ? new Date(selectedDept.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Students</p>
                  <p className="text-indigo-400 text-xl font-bold">
                    {selectedDept.students?.length ?? 0}
                  </p>
                </div>
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Subjects</p>
                  <p className="text-green-400 text-xl font-bold">
                    {selectedDept.subjects?.length ?? 0}
                  </p>
                </div>
              </div>

              <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-gray-200 whitespace-pre-line">
                  {selectedDept.description || "No description provided"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Recent Subjects</p>
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-3 space-y-2">
                  {(selectedDept.subjects || []).slice(0, 5).map((subject) => (
                    <div key={subject.id} className="flex justify-between text-gray-200 text-sm">
                      <span>{subject.name}</span>
                      <span className="text-gray-400">{subject.code}</span>
                    </div>
                  ))}
                  {(selectedDept.subjects || []).length === 0 && (
                    <p className="text-gray-500 text-sm">No subjects linked yet</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Recent Students</p>
                <div className="bg-[#1e1e26] border border-[#353542] rounded-lg p-3 space-y-2">
                  {(selectedDept.students || []).slice(0, 5).map((student) => (
                    <div key={student.id} className="flex justify-between text-gray-200 text-sm">
                      <span>{student.fullName}</span>
                      <span className="text-gray-400">{student.studentId}</span>
                    </div>
                  ))}
                  {(selectedDept.students || []).length === 0 && (
                    <p className="text-gray-500 text-sm">No students enrolled yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Department"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Code</label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="BACHELOR">BACHELOR</option>
                <option value="MASTER">MASTER</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="create-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="create-active" className="text-gray-300">Active</label>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-[#25252b] hover:bg-[#303040] text-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && <FiRefreshCw className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Department"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Code</label>
              <input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="BACHELOR">BACHELOR</option>
                <option value="MASTER">MASTER</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="edit-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="edit-active" className="text-gray-300">Active</label>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#1e1e26] border border-[#353542] rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 bg-[#25252b] hover:bg-[#303040] text-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && <FiRefreshCw className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete ${pendingDelete?.name || "this department"}? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
