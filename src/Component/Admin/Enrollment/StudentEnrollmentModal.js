"use client";

import Modal from "@/Component/Common/Modal";
import { DepartmentService, EnrollmentService, StudentService } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { FiSearch, FiUserCheck, FiUserMinus, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

export default function StudentEnrollmentModal({
  isOpen,
  onClose,
  assignment,
  onEnrollmentChange,
}) {
  const [students, setStudents] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollmentMap, setEnrollmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch students and their enrollment status
  const fetchStudents = useCallback(async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      // Fetch students with filters
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(departmentFilter && { departmentId: departmentFilter }),
        ...(levelFilter && { level: levelFilter }),
      };

      const [studentsRes, enrollmentsRes] = await Promise.all([
        StudentService.getAll(params),
        EnrollmentService.getAll({
          teacherSubjectId: assignment.id,
          subjectId: assignment.subjectId,
        }),
      ]);

      const studentsData = studentsRes.data.data || [];
      const enrollmentsData = enrollmentsRes.data.data || [];

      // Build enrollment lookup
      const enrolledSet = new Set();
      const enrollMap = {};
      enrollmentsData.forEach((enrollment) => {
        enrolledSet.add(enrollment.studentId);
        enrollMap[enrollment.studentId] = enrollment;
      });

      setStudents(studentsData);
      setEnrolledIds(enrolledSet);
      setEnrollmentMap(enrollMap);
      setTotalPages(Math.ceil((studentsRes.data.pagination?.total || studentsData.length) / limit));
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [assignment, page, search, departmentFilter, levelFilter]);

  // Fetch departments for filter
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await DepartmentService.getAll();
      setDepartments(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchStudents();
      fetchDepartments();
    }
  }, [isOpen, assignment, fetchStudents, fetchDepartments]);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setDepartmentFilter("");
      setLevelFilter("");
      setStatusFilter("all");
      setPage(1);
    }
  }, [isOpen]);

  // Handle enroll
  const handleEnroll = async (student) => {
    if (!assignment) return;

    // Check capacity
    if (assignment.enrolledCount >= assignment.capacity) {
      toast.error("Class is full. Cannot enroll more students.");
      return;
    }

    setActionLoading(student.id);
    try {
      await EnrollmentService.create({
        studentId: student.id,
        subjectId: assignment.subjectId,
        teacherSubjectId: assignment.id,
        semester: assignment.semester,
        academicYear: assignment.academicYear,
      });

      // Update local state immediately
      setEnrolledIds((prev) => new Set([...prev, student.id]));
      toast.success(`${student.fullName} enrolled successfully`);

      // Notify parent to refresh data
      if (onEnrollmentChange) onEnrollmentChange();
    } catch (err) {
      const message = err?.data?.error || "Failed to enroll student";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unenroll
  const handleUnenroll = async (student) => {
    const enrollment = enrollmentMap[student.id];
    if (!enrollment) {
      toast.error("Enrollment not found");
      return;
    }

    setActionLoading(student.id);
    try {
      await EnrollmentService.delete(enrollment.id);

      // Update local state immediately
      setEnrolledIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(student.id);
        return newSet;
      });
      setEnrollmentMap((prev) => {
        const newMap = { ...prev };
        delete newMap[student.id];
        return newMap;
      });

      toast.success(`${student.fullName} unenrolled successfully`);

      // Notify parent to refresh data
      if (onEnrollmentChange) onEnrollmentChange();
    } catch (err) {
      const message = err?.data?.error || "Failed to unenroll student";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter students based on status filter
  const filteredStudents = students.filter((student) => {
    if (statusFilter === "enrolled") return enrolledIds.has(student.id);
    if (statusFilter === "not_enrolled") return !enrolledIds.has(student.id);
    return true;
  });

  // Calculate current enrollment count
  const currentEnrolled = enrolledIds.size;
  const availableSpots = assignment ? assignment.capacity - currentEnrolled : 0;

  if (!assignment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enroll Students - ${assignment.subject?.code}: ${assignment.subject?.name}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Header Info */}
        <div className="bg-[#1e1e26] rounded-lg p-4 border border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Teacher</p>
              <p className="text-white font-medium">{assignment.teacher?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Subject</p>
              <p className="text-white font-medium">{assignment.subject?.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Enrolled</p>
              <p className={`font-bold ${currentEnrolled >= assignment.capacity ? "text-red-400" : "text-green-400"}`}>
                {currentEnrolled} / {assignment.capacity}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Available Spots</p>
              <p className={`font-bold ${availableSpots === 0 ? "text-red-400" : "text-blue-400"}`}>
                {availableSpots}
              </p>
            </div>
          </div>
          {/* Capacity Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  currentEnrolled >= assignment.capacity ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min((currentEnrolled / assignment.capacity) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Levels</option>
            <option value="BACHELOR">Bachelor</option>
            <option value="MASTER">Master</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Students</option>
            <option value="enrolled">Enrolled Only</option>
            <option value="not_enrolled">Not Enrolled</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="bg-[#2d2d39] rounded-xl border border-[#35353d] overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-white">
              <thead className="bg-[#25252b] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-400">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-400">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-400">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-400">Level</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-400">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35353d]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      <FiLoader className="animate-spin inline-block mr-2" />
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isEnrolled = enrolledIds.has(student.id);
                    const isLoading = actionLoading === student.id;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-[#35353d]/50 ${
                          isEnrolled ? "border-l-4 border-l-green-500" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-sm text-gray-400">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-indigo-400 font-mono">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {student.department?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              student.level === "BACHELOR"
                                ? "bg-blue-900/50 text-blue-300"
                                : "bg-purple-900/50 text-purple-300"
                            }`}
                          >
                            {student.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEnrolled ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300">
                              Enrolled
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                              Not Enrolled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEnrolled ? (
                            <button
                              onClick={() => handleUnenroll(student)}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center gap-1 mx-auto"
                            >
                              {isLoading ? (
                                <FiLoader className="animate-spin h-4 w-4" />
                              ) : (
                                <FiUserMinus className="h-4 w-4" />
                              )}
                              Unenroll
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnroll(student)}
                              disabled={isLoading || availableSpots === 0}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center gap-1 mx-auto"
                            >
                              {isLoading ? (
                                <FiLoader className="animate-spin h-4 w-4" />
                              ) : (
                                <FiUserCheck className="h-4 w-4" />
                              )}
                              Enroll
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-[#35353d]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
