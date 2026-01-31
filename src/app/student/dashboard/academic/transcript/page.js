"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, GraduationCap } from "lucide-react";
import Link from "next/link";

const TranscriptPage = () => {
  const [student, setStudent] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } = await import(
        "@/lib/auth"
      );

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
      fetchTranscript(user.id);
    };

    load();
  }, [router]);

  const fetchTranscript = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${studentId}/transcript`);
      const result = await response.json();

      if (result.success) {
        setTranscript(result.data);
      } else {
        setError(result.error || "Failed to fetch transcript");
      }
    } catch (err) {
      console.error("Error fetching transcript:", err);
      setError("Failed to fetch transcript");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (letterGrade) => {
    if (!letterGrade) return "text-gray-400";
    if (letterGrade.startsWith("A")) return "text-green-400";
    if (letterGrade.startsWith("B")) return "text-blue-400";
    if (letterGrade.startsWith("C")) return "text-yellow-400";
    if (letterGrade.startsWith("D")) return "text-orange-400";
    return "text-red-400";
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case "Distinction":
        return "bg-green-900/50 text-green-300 border-green-500";
      case "First Class":
        return "bg-blue-900/50 text-blue-300 border-blue-500";
      case "Second Class Upper":
        return "bg-indigo-900/50 text-indigo-300 border-indigo-500";
      case "Second Class Lower":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-500";
      case "Third Class":
        return "bg-orange-900/50 text-orange-300 border-orange-500";
      case "Pass":
        return "bg-gray-700/50 text-gray-300 border-gray-500";
      default:
        return "bg-red-900/50 text-red-300 border-red-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link
          href="/student/dashboard"
          className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!transcript) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/student/dashboard"
            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-2 mb-2 text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="text-indigo-400" />
            Academic Transcript
          </h1>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2">
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {/* Student Info Card */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Student Name</p>
            <p className="text-white font-semibold">{transcript.student.fullName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Student ID</p>
            <p className="text-white font-semibold">{transcript.student.studentId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Department</p>
            <p className="text-white font-semibold">{transcript.student.department?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Level</p>
            <p className="text-white font-semibold">{transcript.student.level}</p>
          </div>
        </div>
      </div>

      {/* CGPA Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30">
          <p className="text-gray-400 text-sm">CGPA</p>
          <p className="text-4xl font-bold text-white">{transcript.transcript.summary.cgpa.toFixed(2)}</p>
          <p className="text-gray-400 text-sm mt-1">out of 4.0</p>
        </div>
        <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
          <p className="text-gray-400 text-sm">Total Credits</p>
          <p className="text-3xl font-bold text-white">{transcript.transcript.summary.totalCredits}</p>
          <p className="text-gray-400 text-sm mt-1">credit hours</p>
        </div>
        <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
          <p className="text-gray-400 text-sm">Courses Completed</p>
          <p className="text-3xl font-bold text-white">{transcript.transcript.summary.completedWithGrades}</p>
          <p className="text-gray-400 text-sm mt-1">graded courses</p>
        </div>
        <div className={`rounded-xl p-6 border ${getClassificationColor(transcript.transcript.summary.classification)}`}>
          <p className="text-gray-400 text-sm">Classification</p>
          <p className="text-2xl font-bold">{transcript.transcript.summary.classification}</p>
        </div>
      </div>

      {/* Semester-wise Grades */}
      {transcript.transcript.semesters.length === 0 ? (
        <div className="bg-[#2d2d39] rounded-xl p-8 border border-[#25252b] text-center">
          <GraduationCap size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No course records found</p>
        </div>
      ) : (
        transcript.transcript.semesters.map((semester, index) => (
          <div key={index} className="bg-[#2d2d39] rounded-xl border border-[#25252b] overflow-hidden">
            {/* Semester Header */}
            <div className="bg-[#25252b] px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {semester.semester !== "N/A" ? `Semester ${semester.semester}` : "Courses"}
                  {semester.academicYear !== "N/A" && ` - ${semester.academicYear}`}
                </h2>
                <p className="text-gray-400 text-sm">
                  {semester.gradedCourses} of {semester.totalCourses} courses graded
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Semester GPA</p>
                <p className="text-2xl font-bold text-white">{semester.semesterGPA.toFixed(2)}</p>
              </div>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1d1d24]">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Course Code</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Course Name</th>
                    <th className="text-center text-gray-400 font-medium px-6 py-3">Credits</th>
                    <th className="text-center text-gray-400 font-medium px-6 py-3">Marks</th>
                    <th className="text-center text-gray-400 font-medium px-6 py-3">Grade</th>
                    <th className="text-center text-gray-400 font-medium px-6 py-3">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35353d]">
                  {semester.courses.map((course) => (
                    <tr key={course.enrollmentId} className="hover:bg-[#35353d]/50">
                      <td className="px-6 py-4">
                        <span className="text-indigo-400 font-medium">{course.subject.code}</span>
                      </td>
                      <td className="px-6 py-4 text-white">{course.subject.name}</td>
                      <td className="px-6 py-4 text-center text-gray-300">{course.subject.creditHours}</td>
                      <td className="px-6 py-4 text-center">
                        {course.grade ? (
                          <span className="text-gray-300">
                            {course.grade.marks}/{course.grade.totalMarks}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {course.grade ? (
                          <span className={`font-bold ${getGradeColor(course.grade.letterGrade)}`}>
                            {course.grade.letterGrade}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {course.grade ? (
                          <span className="text-white">{course.grade.gpa.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Semester Totals */}
                <tfoot className="bg-[#1d1d24] font-semibold">
                  <tr>
                    <td className="px-6 py-3 text-white" colSpan={2}>Semester Total</td>
                    <td className="px-6 py-3 text-center text-white">{semester.totalCredits}</td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3 text-center text-indigo-400">{semester.semesterGPA.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        Generated on {new Date(transcript.generatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

export default TranscriptPage;
