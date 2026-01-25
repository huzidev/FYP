"use client";

import { PageLoading } from "@/Component/Common/LoadingSpinner";
import { SkeletonDashboard } from "@/Component/Common/Skeleton";
import ErrorDisplay, { getErrorMessage } from "@/Component/Common/ErrorDisplay";
import { StudentService, StaffService } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });
  const [teacherStats, setTeacherStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalCapacity: 0,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
      setUserName(user.fullName);
      setUserId(user.id);
    } else {
      // User not logged in, redirect to sign in
      router.push("/staff/signin");
    }
  }, [router]);

  useEffect(() => {
    if (userRole && userId) {
      fetchStats();
    }
  }, [userRole, userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userRole === "TEACHER") {
        // Fetch teacher's courses
        const response = await StaffService.getCourses(userId);
        const data = response.data;

        if (data.success) {
          setCourses(data.data.courses?.slice(0, 4) || []);
          setTeacherStats(data.data.summary || { totalCourses: 0, totalStudents: 0, totalCapacity: 0 });
        }
      } else {
        // Fetch student stats for admission staff
        const studentsResponse = await StudentService.getAll();
        const students = studentsResponse.data.data || [];

        const totalStudents = students.length;
        const activeStudents = students.filter((s) => s.isActive).length;
        const inactiveStudents = totalStudents - activeStudents;

        setStats({
          totalStudents,
          activeStudents,
          inactiveStudents,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <SkeletonDashboard />;
  }

  // Show error with retry
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchStats}
        fullPage
      />
    );
  }

  // Teacher Dashboard
  if (userRole === "TEACHER") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {userName}</h1>
          <p className="text-gray-400">Teacher Dashboard - Manage your courses and students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">My Courses</p>
                <p className="text-3xl font-bold">{teacherStats.totalCourses}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <div className="bg-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold">{teacherStats.totalStudents}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Capacity</p>
                <p className="text-3xl font-bold">{teacherStats.totalCapacity}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-[#25252b] rounded-xl border border-[#35353d]">
          <div className="p-6 border-b border-[#35353d] flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">My Courses</h2>
            <Link href="/staff/dashboard/my-courses" className="text-indigo-400 hover:text-indigo-300 text-sm">
              View All →
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-400">No courses assigned yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#35353d]">
              {courses.map((course) => (
                <Link
                  key={course.teacherSubjectId}
                  href={`/staff/dashboard/my-courses/${course.teacherSubjectId}`}
                  className="block p-4 hover:bg-[#2d2d39] transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-indigo-400">{course.subject.code}</span>
                      <h3 className="text-white font-medium">{course.subject.name}</h3>
                      <p className="text-gray-400 text-sm">{course.subject.department?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${course.isFull ? "text-red-400" : "text-green-400"}`}>
                        {course.enrolledCount}/{course.capacity} students
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admission Staff Dashboard
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      bgColor: "bg-blue-600",
      icon: "👥",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      bgColor: "bg-green-600",
      icon: "✅",
    },
    {
      title: "Inactive Students",
      value: stats.inactiveStudents,
      bgColor: "bg-red-600",
      icon: "❌",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {userName || "Staff"}</h1>
        <p className="text-gray-400">Admission Dashboard - Manage student enrollments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#25252b] rounded-xl p-6 border border-[#35353d]">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/staff/dashboard/students"
            className="bg-[#1d1d24] rounded-lg p-4 hover:bg-[#2d2d39] transition-colors text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <p className="text-white font-medium">Manage Students</p>
          </Link>
          <Link
            href="/staff/dashboard/announcements"
            className="bg-[#1d1d24] rounded-lg p-4 hover:bg-[#2d2d39] transition-colors text-center"
          >
            <div className="text-3xl mb-2">📢</div>
            <p className="text-white font-medium">Announcements</p>
          </Link>
          <div className="bg-[#1d1d24] rounded-lg p-4 text-center opacity-50 cursor-not-allowed">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-white font-medium">Reports (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
