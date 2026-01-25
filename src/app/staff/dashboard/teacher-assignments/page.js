"use client";

import { SubjectService, TeacherSubjectService } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function StaffTeacherAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterSubject, setFilterSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Check if user is admission staff
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/staff/signin");
      return;
    }
    if (user.role !== "ADMISSION") {
      router.push("/staff/dashboard");
    }
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

  // Fetch subjects for filter
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await SubjectService.getAll();
      setSubjects(response.data.data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, [fetchAssignments, fetchSubjects]);

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      a.teacher?.fullName.toLowerCase().includes(searchLower) ||
      a.teacher?.staffId.toLowerCase().includes(searchLower) ||
      a.subject?.name.toLowerCase().includes(searchLower) ||
      a.subject?.code.toLowerCase().includes(searchLower);

    // Availability filter
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Teacher Assignments</h1>
        <p className="text-gray-400">View available teachers per subject for student enrollment</p>
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
          {Object.values(groupedBySubject).map(({ subject, teachers }) => (
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
                    <p className="text-gray-400 text-sm">{teachers.length} Teacher(s)</p>
                    <p className="text-sm">
                      <span className="text-green-400">
                        {teachers.filter((t) => !t.isFull).length} available
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Teachers List */}
              <div className="divide-y divide-[#35353d]">
                {teachers.map((assignment) => (
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
                    <div className="flex items-center gap-6">
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
            <p className="text-blue-300 font-medium">Read-Only View</p>
            <p className="text-gray-400 text-sm">
              This page shows teacher assignments for reference during student enrollment.
              To create or modify assignments, please contact an administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
