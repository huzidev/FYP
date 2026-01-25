"use client";

import { StaffService, ApiResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getCurrentUser();
      if (!user?.id) {
        // Redirect to sign in if user not found
        router.push("/staff/signin");
        return;
      }

      const response = await StaffService.getCourses(user.id);
      const data = response.data;

      if (data.success) {
        setCourses(data.data.courses || []);
        setSummary(data.data.summary || null);
        setTeacherInfo(data.data.teacher || null);
      } else {
        setError(data.error || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(ApiResponse.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading your courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-400">
            {teacherInfo ? `Welcome, ${teacherInfo.fullName}` : "View and manage your assigned courses"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Courses</p>
                <p className="text-3xl font-bold">{summary.totalCourses}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <div className="bg-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold">{summary.totalStudents}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Capacity</p>
                <p className="text-3xl font-bold">{summary.totalCapacity}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="bg-[#25252b] rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Courses Assigned</h3>
          <p className="text-gray-400">You haven't been assigned to any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.teacherSubjectId}
              href={`/staff/dashboard/my-courses/${course.teacherSubjectId}`}
              className="block"
            >
              <div className="bg-[#25252b] rounded-xl p-6 hover:bg-[#2d2d39] transition-colors border border-[#35353d] hover:border-indigo-500">
                {/* Course Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-medium">{course.subject.code}</span>
                    <h3 className="text-lg font-semibold text-white mt-1">{course.subject.name}</h3>
                  </div>
                  <span className="text-2xl">📖</span>
                </div>

                {/* Department */}
                <p className="text-gray-400 text-sm mb-4">
                  {course.subject.department?.name || "No Department"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Students:</span>
                    <span className={`font-medium ${course.isFull ? "text-red-400" : "text-green-400"}`}>
                      {course.enrolledCount} / {course.capacity}
                    </span>
                  </div>
                  <span className="text-gray-400">{course.subject.creditHours} Credits</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${course.isFull ? "bg-red-500" : "bg-indigo-500"}`}
                      style={{ width: `${Math.min((course.enrolledCount / course.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex justify-between items-center">
                  {course.isFull ? (
                    <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">Class Full</span>
                  ) : (
                    <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">
                      {course.availableSpots} spots available
                    </span>
                  )}
                  <span className="text-indigo-400 text-sm">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
