"use client";

import Modal from "@/Component/Common/Modal";
import { StaffService, SubjectService, TeacherSubjectService } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form state
  const [form, setForm] = useState({
    teacherId: "",
    subjectId: "",
    capacity: 50,
    semester: "",
    academicYear: "",
  });

  // Filters
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Fetch all assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTeacher) params.teacherId = filterTeacher;
      if (filterSubject) params.subjectId = filterSubject;

      const response = await TeacherSubjectService.getAll(params);
      setAssignments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to fetch teacher assignments");
    } finally {
      setLoading(false);
    }
  }, [filterTeacher, filterSubject]);

  // Fetch teachers and subjects for dropdowns
  const fetchDropdownData = useCallback(async () => {
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        StaffService.getAll({ role: "TEACHER", limit: 1000 }),
        SubjectService.getAll(),
      ]);
      setTeachers(teachersRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchDropdownData();
  }, [fetchAssignments, fetchDropdownData]);

  // Create assignment
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.teacherId || !form.subjectId) {
      toast.error("Please select both teacher and subject");
      return;
    }

    try {
      await TeacherSubjectService.create({
        teacherId: parseInt(form.teacherId),
        subjectId: parseInt(form.subjectId),
        capacity: parseInt(form.capacity) || 50,
        semester: form.semester || null,
        academicYear: form.academicYear || null,
      });
      toast.success("Teacher assigned to subject successfully!");
      resetForm();
      setIsCreateOpen(false);
      fetchAssignments();
    } catch (err) {
      const message = err?.data?.error || "Failed to create assignment";
      toast.error(message);
    }
  };

  // Update assignment
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      await TeacherSubjectService.update(selectedAssignment.id, {
        capacity: parseInt(form.capacity) || 50,
        isActive: form.isActive,
        semester: form.semester || null,
        academicYear: form.academicYear || null,
      });
      toast.success("Assignment updated successfully!");
      setIsEditOpen(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      const message = err?.data?.error || "Failed to update assignment";
      toast.error(message);
    }
  };

  // Delete assignment
  const handleDelete = async () => {
    if (!selectedAssignment) return;

    try {
      await TeacherSubjectService.delete(selectedAssignment.id);
      toast.success("Assignment deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      const message = err?.data?.error || "Failed to delete assignment";
      toast.error(message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (assignment) => {
    try {
      await TeacherSubjectService.update(assignment.id, {
        isActive: !assignment.isActive,
      });
      toast.success(`Assignment ${assignment.isActive ? "deactivated" : "activated"} successfully!`);
      fetchAssignments();
    } catch (err) {
      const message = err?.data?.error || "Failed to update status";
      toast.error(message);
    }
  };

  // Open edit modal
  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setForm({
      teacherId: assignment.teacherId,
      subjectId: assignment.subjectId,
      capacity: assignment.capacity,
      semester: assignment.semester || "",
      academicYear: assignment.academicYear || "",
      isActive: assignment.isActive,
    });
    setIsEditOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      teacherId: "",
      subjectId: "",
      capacity: 50,
      semester: "",
      academicYear: "",
    });
  };

  // Calculate stats
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.isActive).length;
  const totalEnrolled = assignments.reduce((sum, a) => sum + (a.enrolledCount || 0), 0);
  const totalCapacity = assignments.reduce((sum, a) => sum + (a.capacity || 0), 0);

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading teacher assignments...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Assignments</h1>
          <p className="text-gray-400">Assign teachers to subjects and manage capacity</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-600/20 border border-indigo-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold text-indigo-400">{totalAssignments}</p>
        </div>
        <div className="bg-green-600/20 border border-green-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-400">{activeAssignments}</p>
        </div>
        <div className="bg-blue-600/20 border border-blue-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Enrolled</p>
          <p className="text-3xl font-bold text-blue-400">{totalEnrolled}</p>
        </div>
        <div className="bg-purple-600/20 border border-purple-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Capacity</p>
          <p className="text-3xl font-bold text-purple-400">{totalCapacity}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Teachers</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName} ({t.staffId})
            </option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.name}
            </option>
          ))}
        </select>
        {(filterTeacher || filterSubject) && (
          <button
            onClick={() => {
              setFilterTeacher("");
              setFilterSubject("");
            }}
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-[#2d2d39] rounded-xl border border-[#25252b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead className="bg-[#25252b]">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-400">Teacher</th>
                <th className="text-left px-6 py-4 font-medium text-gray-400">Subject</th>
                <th className="text-left px-6 py-4 font-medium text-gray-400">Department</th>
                <th className="text-center px-6 py-4 font-medium text-gray-400">Enrolled / Capacity</th>
                <th className="text-center px-6 py-4 font-medium text-gray-400">Status</th>
                <th className="text-center px-6 py-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35353d]">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No teacher assignments found
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-[#35353d]/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{assignment.teacher?.fullName}</p>
                        <p className="text-sm text-gray-400">{assignment.teacher?.staffId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{assignment.subject?.name}</p>
                        <p className="text-sm text-indigo-400">{assignment.subject?.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {assignment.subject?.department?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${assignment.isFull ? "text-red-400" : "text-green-400"}`}>
                          {assignment.enrolledCount} / {assignment.capacity}
                        </span>
                        <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${assignment.isFull ? "bg-red-500" : "bg-green-500"}`}
                            style={{
                              width: `${Math.min((assignment.enrolledCount / assignment.capacity) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        {assignment.isFull && (
                          <span className="text-xs text-red-400 mt-1">Full</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(assignment)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          assignment.isActive
                            ? "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                            : "bg-red-900/50 text-red-300 hover:bg-red-900/70"
                        }`}
                      >
                        {assignment.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(assignment)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          title="Delete"
                          disabled={assignment.enrolledCount > 0}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Teacher Assignment" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teacher *</label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.staffId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Subject *</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.department?.name || "No Dept"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
              placeholder="50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
              <input
                type="text"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Fall 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Assignment" size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="bg-[#1e1e26] rounded-lg p-4 border border-gray-600">
            <p className="text-sm text-gray-400">Teacher</p>
            <p className="text-white font-medium">{selectedAssignment?.teacher?.fullName}</p>
            <p className="text-sm text-gray-400 mt-2">Subject</p>
            <p className="text-white font-medium">
              {selectedAssignment?.subject?.code} - {selectedAssignment?.subject?.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min={selectedAssignment?.enrolledCount || 1}
            />
            {selectedAssignment?.enrolledCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Minimum capacity: {selectedAssignment.enrolledCount} (current enrollment)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
              <input
                type="text"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Fall 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Assignment" size="sm">
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this assignment?
          </p>
          <div className="bg-[#1e1e26] rounded-lg p-4 border border-gray-600">
            <p className="text-white font-medium">{selectedAssignment?.teacher?.fullName}</p>
            <p className="text-indigo-400">
              {selectedAssignment?.subject?.code} - {selectedAssignment?.subject?.name}
            </p>
          </div>
          {selectedAssignment?.enrolledCount > 0 && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
              Cannot delete: {selectedAssignment.enrolledCount} students are enrolled in this course.
              Please remove enrollments first.
            </div>
          )}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={selectedAssignment?.enrolledCount > 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
