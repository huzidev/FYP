"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "react-toastify";

const CurrentCoursesPage = () => {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* ===================== AUTH + LOAD ===================== */
  useEffect(() => {
    const load = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } =
        await import("@/lib/auth");

      if (!isAuthenticated()) {
        router.replace("/student/signin");
        return;
      }

      const user = getCurrentUser();
      if (!user || user.userType !== USER_TYPES.STUDENT) {
        router.replace("/student/signin");
        return;
      }

      setStudent(user);
      await fetchCurrentCourses(user.id);
      setLoading(false);
    };

    load();
  }, [router]);

  /* ===================== FETCH COURSES ===================== */
  const fetchCurrentCourses = async (studentId) => {
    try {
      const res = await fetch(`/api/enrollments?studentId=${studentId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }

      setCourses(data.data);
    } catch (err) {
      toast.error("Failed to load current courses");
    }
  };

  /* ===================== SUMMARY ===================== */
  const totalCourses = courses.length;
  const totalCredits = courses.reduce(
    (sum, e) => sum + (e.subject?.creditHours || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      {/* HEADER */}
      <div>
        <Link
          href="/student/dashboard"
          className="text-indigo-400 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mt-2">Current Courses</h1>
        <p className="text-gray-400 text-sm">Active academic load</p>
      </div>

      {/* SUMMARY */}
      <div className="bg-[#2d2d39] p-6 rounded-xl grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Courses</p>
          <p className="text-2xl font-bold text-white">{totalCourses}</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">Total Credit Hours</p>
          <p className="text-2xl font-bold text-white">{totalCredits}</p>
        </div>
      </div>

      {/* COURSES LIST */}
      <div className="bg-[#2d2d39] p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-400" />
          Enrolled Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-gray-400">No active courses found.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((e) => (
              <div key={e.id} className="bg-[#1e1e26] p-4 rounded border">
                <p className="text-indigo-400">{e.subject.code}</p>
                <p className="text-white font-semibold">{e.subject.name}</p>
                <p className="text-gray-400 text-sm">
                  Semester {e.semester} • Credits {e.subject.creditHours}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentCoursesPage;
