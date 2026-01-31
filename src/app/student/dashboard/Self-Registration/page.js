"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const EnrollmentPage = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [courseCode, setCourseCode] = useState("");

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  /* ===================== AUTH + INITIAL LOAD ===================== */
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
      await fetchEnrolledCourses(user.id, 1, limit);
      setLoading(false);
    };

    load();
  }, [router]);

  /* ===================== FETCH ENROLLED COURSES ===================== */
  const fetchEnrolledCourses = async (studentId, pageNo = 1, limitNo = 5) => {
    try {
      const res = await fetch(
        `/api/enrollments?studentId=${studentId}&page=${pageNo}&limit=${limitNo}`,
      );
      const data = await res.json();

      if (data.success) {
        setEnrolledCourses(data.data);
        setTotalPages(data.totalPages);
        setPage(pageNo);
      }
    } catch (err) {
      toast.error("Failed to load enrolled courses");
    }
  };

  /* ===================== SEARCH COURSES ===================== */
  const handleSearch = async () => {
    if (!courseCode.trim()) {
      toast.error("Course code is required");
      return;
    }

    try {
      const params = new URLSearchParams({
        departmentId: student.department.id,
        search: courseCode.trim(),
      });

      const res = await fetch(`/api/subjects?${params.toString()}`);
      const data = await res.json();

      if (!data.success || data.data.length === 0) {
        toast.info("No course found");
        setFilteredCourses([]);
        return;
      }

      setFilteredCourses(data.data);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  /* ===================== ENROLL ===================== */
  const handleEnroll = async (subjectId, courseSemester) => {
    const currentYear = new Date().getFullYear();

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          subjectId,
          semester: String(courseSemester),
          academicYear: String(currentYear),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Enrollment failed");
        return;
      }

      toast.success("Course added successfully 🎉");
      fetchEnrolledCourses(student.id, page, limit);
    } catch (err) {
      toast.error("Server error");
    }
  };

  /* ===================== REMOVE ENROLLMENT ===================== */
  const handleRemoveEnrollment = async (enrollmentId) => {
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Remove failed");
        return;
      }

      toast.success("Enrollment removed successfully");
      fetchEnrolledCourses(student.id, page, limit);
    } catch (err) {
      toast.error("Server error");
    }
  };

  const isAlreadyEnrolled = (subjectId) =>
    enrolledCourses.some((e) => e.subjectId === subjectId);

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

        <h1 className="text-3xl font-bold text-white mt-2">
          Self Registration
        </h1>
        <p className="text-gray-400 text-sm">
          Department: {student.department?.name}
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-[#2d2d39] p-6 rounded-xl grid sm:grid-cols-2 gap-4">
        <input
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="Course Code"
          className="px-4 py-3 rounded bg-[#1e1e26] text-white"
        />

        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white rounded flex items-center justify-center gap-2"
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* SEARCH RESULTS */}
      {filteredCourses.length > 0 && (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-[#1e1e26] p-4 rounded border">
              <div className="flex justify-between">
                <div>
                  <p className="text-indigo-400">{course.code}</p>
                  <p className="text-white font-bold">{course.name}</p>
                  <p className="text-gray-400 text-sm">
                    Semester {course.semester} | Credits {course.creditHours}
                  </p>
                </div>

                <button
                  disabled={isAlreadyEnrolled(course.id)}
                  onClick={() => handleEnroll(course.id, course.semester)}
                  className={`px-4 py-2 rounded ${
                    isAlreadyEnrolled(course.id)
                      ? "bg-gray-500"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isAlreadyEnrolled(course.id) ? "Enrolled" : "Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLLED COURSES */}
      <div className="bg-[#2d2d39] p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-400" />
          Enrolled Courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <p className="text-gray-400">No courses enrolled yet.</p>
        ) : (
          <div className="space-y-3">
            {enrolledCourses.map((e) => (
              <div
                key={e.id}
                className="bg-[#1e1e26] p-4 rounded border flex justify-between"
              >
                <div>
                  <p className="text-indigo-400">{e.subject.code}</p>
                  <p className="text-white font-semibold">{e.subject.name}</p>
                  <p className="text-gray-400 text-sm">
                    Semester {e.semester} | Credits {e.subject.creditHours}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveEnrollment(e.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded flex items-center gap-2"
                >
                  <Trash2 size={18} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentPage;
