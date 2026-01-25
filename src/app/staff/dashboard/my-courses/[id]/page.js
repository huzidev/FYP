"use client";

import { TeacherSubjectService, ApiResponse } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseDetailPage() {
  const params = useParams();
  const teacherSubjectId = params.id;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGrades, setEditingGrades] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (teacherSubjectId) {
      fetchCourseDetails();
    }
  }, [teacherSubjectId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TeacherSubjectService.getById(teacherSubjectId);
      const data = response.data;

      if (data.success) {
        setCourseData(data.data);
        // Initialize grade inputs with existing grades
        const initialGrades = {};
        data.data.enrollments?.forEach((enrollment) => {
          if (enrollment.grade) {
            initialGrades[enrollment.id] = {
              marks: enrollment.grade.marks?.toString() || "",
              totalMarks: enrollment.grade.totalMarks?.toString() || "100",
            };
          } else {
            initialGrades[enrollment.id] = { marks: "", totalMarks: "100" };
          }
        });
        setGradeInputs(initialGrades);
      } else {
        setError(data.error || "Failed to fetch course details");
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError(ApiResponse.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (enrollmentId, field, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const saveGrades = async () => {
    try {
      setSavingGrades(true);
      setSaveMessage(null);

      // Prepare grades for bulk update
      const gradesToSave = Object.entries(gradeInputs)
        .filter(([_, grade]) => grade.marks !== "")
        .map(([enrollmentId, grade]) => ({
          enrollmentId: parseInt(enrollmentId),
          marks: parseFloat(grade.marks),
          totalMarks: parseFloat(grade.totalMarks) || 100,
        }));

      if (gradesToSave.length === 0) {
        setSaveMessage({ type: "error", text: "No grades to save" });
        return;
      }

      const response = await fetch("/api/grades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: gradesToSave }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage({
          type: "success",
          text: `${result.data.created} created, ${result.data.updated} updated${
            result.data.failed.length > 0 ? `, ${result.data.failed.length} failed` : ""
          }`,
        });
        // Refresh data
        fetchCourseDetails();
        setEditingGrades(false);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save grades" });
      }
    } catch (err) {
      console.error("Error saving grades:", err);
      setSaveMessage({ type: "error", text: "Failed to save grades" });
    } finally {
      setSavingGrades(false);
    }
  };

  const filteredStudents = courseData?.enrollments?.filter((enrollment) => {
    const student = enrollment.student;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Calculate class statistics
  const gradedCount = courseData?.enrollments?.filter((e) => e.grade)?.length || 0;
  const averageGrade = courseData?.enrollments?.reduce((sum, e) => {
    if (e.grade?.percentage) return sum + e.grade.percentage;
    return sum;
  }, 0) / (gradedCount || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading course details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/staff/dashboard/my-courses" className="text-indigo-400 hover:text-indigo-300">
          ← Back to My Courses
        </Link>
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="space-y-4">
        <Link href="/staff/dashboard/my-courses" className="text-indigo-400 hover:text-indigo-300">
          ← Back to My Courses
        </Link>
        <div className="text-white">Course not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link href="/staff/dashboard/my-courses" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-2">
        ← Back to My Courses
      </Link>

      {/* Course Header */}
      <div className="bg-[#25252b] rounded-xl p-6 border border-[#35353d]">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-indigo-400 font-medium">{courseData.subject?.code}</span>
            <h1 className="text-2xl font-bold text-white mt-1">{courseData.subject?.name}</h1>
            <p className="text-gray-400 mt-2">{courseData.subject?.department?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">📖</div>
            <span className="text-gray-400">{courseData.subject?.creditHours} Credits</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-[#1d1d24] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Enrolled</p>
            <p className="text-2xl font-bold text-white">{courseData.enrolledCount}</p>
          </div>
          <div className="bg-[#1d1d24] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Capacity</p>
            <p className="text-2xl font-bold text-white">{courseData.capacity}</p>
          </div>
          <div className="bg-[#1d1d24] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Graded</p>
            <p className="text-2xl font-bold text-blue-400">{gradedCount}</p>
          </div>
          <div className="bg-[#1d1d24] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Avg Grade</p>
            <p className="text-2xl font-bold text-green-400">
              {gradedCount > 0 ? `${averageGrade.toFixed(1)}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`px-4 py-3 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-900/50 border border-green-500 text-green-200"
              : "bg-red-900/50 border border-red-500 text-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Student Roster with Grades */}
      <div className="bg-[#25252b] rounded-xl border border-[#35353d]">
        <div className="p-6 border-b border-[#35353d]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Student Roster & Grades</h2>
            <div className="flex gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1d1d24] border border-[#35353d] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              {/* Edit/Save Button */}
              {editingGrades ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGrades(false);
                      fetchCourseDetails(); // Reset to saved values
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    disabled={savingGrades}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGrades}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                    disabled={savingGrades}
                  >
                    {savingGrades ? "Saving..." : "Save Grades"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGrades(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Enter Grades
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Table */}
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-400">
              {searchTerm ? "No students match your search" : "No students enrolled yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1d1d24]">
                <tr>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">#</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">Student ID</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">Name</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">Email</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">Status</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4 w-48">
                    {editingGrades ? "Marks / Total" : "Grade"}
                  </th>
                  {!editingGrades && (
                    <th className="text-left text-gray-400 font-medium px-6 py-4">GPA</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35353d]">
                {filteredStudents.map((enrollment, index) => (
                  <tr key={enrollment.id} className="hover:bg-[#2d2d39]">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{enrollment.student.studentId}</td>
                    <td className="px-6 py-4 text-white">{enrollment.student.fullName}</td>
                    <td className="px-6 py-4 text-gray-400">{enrollment.student.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        enrollment.status === "ACTIVE"
                          ? "bg-green-900/50 text-green-300"
                          : enrollment.status === "COMPLETED"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-red-900/50 text-red-300"
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingGrades ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={gradeInputs[enrollment.id]?.totalMarks || 100}
                            value={gradeInputs[enrollment.id]?.marks || ""}
                            onChange={(e) => handleGradeChange(enrollment.id, "marks", e.target.value)}
                            placeholder="Marks"
                            className="w-20 bg-[#1d1d24] border border-[#35353d] text-white rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            type="number"
                            min="1"
                            value={gradeInputs[enrollment.id]?.totalMarks || "100"}
                            onChange={(e) => handleGradeChange(enrollment.id, "totalMarks", e.target.value)}
                            className="w-16 bg-[#1d1d24] border border-[#35353d] text-white rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      ) : enrollment.grade ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            enrollment.grade.letterGrade?.startsWith("A") ? "text-green-400" :
                            enrollment.grade.letterGrade?.startsWith("B") ? "text-blue-400" :
                            enrollment.grade.letterGrade?.startsWith("C") ? "text-yellow-400" :
                            enrollment.grade.letterGrade?.startsWith("D") ? "text-orange-400" :
                            "text-red-400"
                          }`}>
                            {enrollment.grade.letterGrade}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ({enrollment.grade.marks}/{enrollment.grade.totalMarks})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not graded</span>
                      )}
                    </td>
                    {!editingGrades && (
                      <td className="px-6 py-4">
                        {enrollment.grade ? (
                          <span className="text-white">{enrollment.grade.gpa?.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#35353d] flex justify-between text-gray-400 text-sm">
          <span>Showing {filteredStudents.length} of {courseData.enrollments?.length || 0} students</span>
          <span>{gradedCount} of {courseData.enrollments?.length || 0} graded</span>
        </div>
      </div>
    </div>
  );
}
