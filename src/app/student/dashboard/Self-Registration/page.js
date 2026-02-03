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

  // 🔹 NEW → Fee Clearance State
  const [isFeeCleared, setIsFeeCleared] = useState(false);

  const [teachersByCourse, setTeachersByCourse] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState({});

  const router = useRouter();

  /* ===================== AUTH ===================== */
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

      await fetchEnrolledCourses(user.id);
      await checkFeeClearance(user.id); // ⭐ NEW

      setLoading(false);
    };

    load();
  }, [router]);

  /* ===================== FEE CLEARANCE CHECK ===================== */
  const checkFeeClearance = async (studentId) => {
    try {
      const res = await fetch(`/api/fees/clearance?studentId=${studentId}`);
      const data = await res.json();

      if (res.ok) {
        setIsFeeCleared(data.allowed);
      } else {
        setIsFeeCleared(false);
      }
    } catch {
      setIsFeeCleared(false);
    }
  };

  /* ===================== FETCH ENROLLED ===================== */
  const fetchEnrolledCourses = async (studentId) => {
    try {
      const res = await fetch(`/api/enrollments?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) setEnrolledCourses(data.data);
    } catch {
      toast.error("Failed to load enrolled courses");
    }
  };

  /* ===================== SEARCH ===================== */
  const handleSearch = async () => {
    if (!isFeeCleared) {
      toast.error("You don't have enrollment access at this time");
      return;
    }

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
      data.data.forEach(fetchTeachersForCourse);
    } catch {
      toast.error("Search failed");
    }
  };

  /* ===================== FETCH TEACHERS ===================== */
  const fetchTeachersForCourse = async (course) => {
    try {
      const res = await fetch(`/api/teacher-subjects?subjectId=${course.id}`);
      const data = await res.json();

      if (data.success) {
        setTeachersByCourse((prev) => ({
          ...prev,
          [course.id]: data.data,
        }));
      }
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  /* ===================== ENROLL ===================== */
  const handleEnroll = async (course) => {
    // ⭐ SECURITY CHECK
    if (!isFeeCleared) {
      toast.error("You don't have enrollment access at this time");
      return;
    }

    const teacherSubject = selectedTeacher[course.id];
    if (!teacherSubject) {
      toast.error("Please select a teacher");
      return;
    }

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          subjectId: course.id,
          teacherId: teacherSubject.teacherId,
          teacherSubjectId: teacherSubject.id,
          semester: String(course.semester),
          academicYear: String(new Date().getFullYear()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Enrollment failed");
        return;
      }

      toast.success("Course enrolled successfully 🎉");
      fetchEnrolledCourses(student.id);
    } catch {
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
      fetchEnrolledCourses(student.id);
    } catch {
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

  return (
    <div className="p-6 space-y-6">
      <Link href="/student/dashboard" className="text-indigo-400 flex gap-2">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="text-3xl font-bold text-white">Self Registration</h1>

      {/* ⭐ SHOW WARNING IF FEE NOT CLEARED */}
      {!isFeeCleared && (
        <div className="bg-red-600/20 border border-red-500 text-red-300 p-4 rounded">
          You don't have enrollment access at this time. Please clear your fees.
        </div>
      )}

      {/* SEARCH */}
      <div className="grid sm:grid-cols-2 gap-4 bg-[#2d2d39] p-6 rounded-xl">
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
      {filteredCourses.map((course) => (
        <div
          key={course.id}
          className="bg-[#1e1e26] p-4 rounded border space-y-3"
        >
          <div>
            <p className="text-indigo-400">{course.code}</p>
            <p className="text-white font-bold">{course.name}</p>
            <p className="text-gray-400 text-sm">
              Semester {course.semester} | Credits {course.creditHours}
            </p>
          </div>

          <select
            className="w-full bg-[#2d2d39] text-white p-2 rounded"
            value={selectedTeacher[course.id]?.id || ""}
            onChange={(e) => {
              const teacher = teachersByCourse[course.id].find(
                (t) => t.id === parseInt(e.target.value),
              );
              setSelectedTeacher((prev) => ({
                ...prev,
                [course.id]: teacher,
              }));
            }}
          >
            <option value="">Select Teacher</option>
            {(teachersByCourse[course.id] || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.teacher.fullName} ({t.availableSpots} seats)
              </option>
            ))}
          </select>

          <button
            disabled={isAlreadyEnrolled(course.id) || !isFeeCleared}
            onClick={() => handleEnroll(course)}
            className={`px-4 py-2 rounded w-full ${
              isAlreadyEnrolled(course.id) || !isFeeCleared
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAlreadyEnrolled(course.id)
              ? "Enrolled"
              : !isFeeCleared
                ? "Fee Pending"
                : "Enroll"}
          </button>
        </div>
      ))}

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
