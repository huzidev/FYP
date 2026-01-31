"use client";

import Modal from "@/Component/Common/Modal";
import StudentEnrollmentModal from "@/Component/Admin/Enrollment/StudentEnrollmentModal";
import { StaffService, SubjectService, TeacherSubjectService } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";

export default function StaffTeacherAssignmentsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
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
  const [filterSubject, setFilterSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Check user and set permissions
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/staff/signin");
      return;
    }
    // Allow both ADMISSION and TEACHER roles
    if (user.role !== "ADMISSION" && user.role !== "TEACHER") {
      router.push("/staff/dashboard");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { isActive: true };
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
  }, [filterSubject]);

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
    if (currentUser) {
      fetchAssignments();
      fetchDropdownData();
    }
  }, [currentUser, fetchAssignments, fetchDropdownData]);

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

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      a.teacher?.fullName?.toLowerCase().includes(searchLower) ||
      a.teacher?.staffId?.toLowerCase().includes(searchLower) ||
      a.subject?.name?.toLowerCase().includes(searchLower) ||
      a.subject?.code?.toLowerCase().includes(searchLower);

    const matchesAvailability = !showOnlyAvailable || !a.isFull;

    return matchesSearch && matchesAvailability;
  });

  // Group by subject for better view
  const groupedBySubject = filteredAssignments.reduce((acc, assignment) => {
    const subjectId = assignment.subject?.id;
    if (!acc[subjectId]) {
      acc[subjectId] = {
        subject: assignment.subject,
        teachers: [],
      };
    }
    acc[subjectId].teachers.push(assignment);
    return acc;
  }, {});

  // Stats
  const totalAssignments = assignments.length;
  const availableAssignments = assignments.filter((a) => !a.isFull).length;
  const totalSeats = assignments.reduce((sum, a) => sum + (a.capacity || 0), 0);
  const availableSeats = assignments.reduce((sum, a) => sum + (a.availableSpots || 0), 0);

  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading teacher assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Assignments</h1>
          <p className="text-gray-400">View and manage teacher-subject assignments</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-600/20 border border-indigo-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold text-indigo-400">{totalAssignments}</p>
        </div>
        <div className="bg-green-600/20 border border-green-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">With Availability</p>
          <p className="text-3xl font-bold text-green-400">{availableAssignments}</p>
        </div>
        <div className="bg-blue-600/20 border border-blue-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Seats</p>
          <p className="text-3xl font-bold text-blue-400">{totalSeats}</p>
        </div>
        <div className="bg-purple-600/20 border border-purple-600 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Available Seats</p>
          <p className="text-3xl font-bold text-purple-400">{availableSeats}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#25252b] rounded-xl p-4 border border-[#35353d]">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search teacher or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[200px]"
          />
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
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-[#1e1e26] text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show only available</span>
          </label>
          {(searchTerm || filterSubject || showOnlyAvailable) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterSubject("");
                setShowOnlyAvailable(false);
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Grouped View by Subject */}
      {Object.keys(groupedBySubject).length === 0 ? (
        <div className="bg-[#25252b] rounded-xl p-8 text-center border border-[#35353d]">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-400">No teacher assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedBySubject).map(({ subject, teachers: teacherAssignments }) => (
            <div key={subject.id} className="bg-[#25252b] rounded-xl border border-[#35353d] overflow-hidden">
              {/* Subject Header */}
              <div className="bg-[#1d1d24] px-6 py-4 border-b border-[#35353d]">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-indigo-400 text-sm font-medium">{subject.code}</span>
                    <h3 className="text-xl font-semibold text-white">{subject.name}</h3>
                    <p className="text-gray-400 text-sm">{subject.department?.name || "No Department"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{teacherAssignments.length} Teacher(s)</p>
                    <p className="text-sm">
                      <span className="text-green-400">
                        {teacherAssignments.filter((t) => !t.isFull).length} available
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Teachers List */}
              <div className="divide-y divide-[#35353d]">
                {teacherAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`px-6 py-4 flex justify-between items-center ${
                      assignment.isFull ? "opacity-60" : "hover:bg-[#2d2d39]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                        {assignment.teacher?.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{assignment.teacher?.fullName}</p>
                        <p className="text-gray-400 text-sm">{assignment.teacher?.staffId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Availability */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${assignment.isFull ? "text-red-400" : "text-green-400"}`}>
                            {assignment.enrolledCount} / {assignment.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {assignment.isFull ? (
                            <span className="text-red-400">No seats available</span>
                          ) : (
                            <span className="text-green-400">{assignment.availableSpots} seats available</span>
                          )}
                        </p>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-24">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${assignment.isFull ? "bg-red-500" : "bg-green-500"}`}
                            style={{
                              width: `${Math.min((assignment.enrolledCount / assignment.capacity) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.isFull
                            ? "bg-red-900/50 text-red-300"
                            : "bg-green-900/50 text-green-300"
                        }`}
                      >
                        {assignment.isFull ? "Full" : "Available"}
                      </span>
                      {/* Enroll Students Button */}
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsEnrollOpen(true);
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        title="Enroll Students"
                      >
                        <FiUsers className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="text-blue-300 font-medium">Staff Access</p>
            <p className="text-gray-400 text-sm">
              You can create new teacher assignments and enroll students.
              For editing or deleting assignments, please contact an administrator.
            </p>
          </div>
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

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={isEnrollOpen}
        onClose={() => {
          setIsEnrollOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onEnrollmentChange={fetchAssignments}
      />
    </div>
  );
}
