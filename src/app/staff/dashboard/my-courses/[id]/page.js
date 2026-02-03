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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    classParticipation: 0,
    midTerm: 0,
    project: 0,
    finalTerm: 0,
    assignment: 0,
    quiz: 0,
    remarks: ''
  });
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

  // Handle edit grade button click
  const handleEditGrade = (enrollment) => {
    setSelectedStudent(enrollment);
    
    // Pre-populate form with existing grades if available
    if (enrollment.grade) {
      setGradeForm({
        classParticipation: enrollment.grade.classParticipation || 0,
        midTerm: enrollment.grade.midTerm || 0,
        project: enrollment.grade.project || 0,
        finalTerm: enrollment.grade.finalTerm || 0,
        assignment: enrollment.grade.assignment || 0,
        quiz: enrollment.grade.quiz || 0,
        remarks: enrollment.grade.remarks || ''
      });
    } else {
      setGradeForm({
        classParticipation: 0,
        midTerm: 0,
        project: 0,
        finalTerm: 0,
        assignment: 0,
        quiz: 0,
        remarks: ''
      });
    }
    
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleGradeChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setGradeForm(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Save individual grade
  const saveGrade = async () => {
    if (!selectedStudent) return;
    
    try {
      setSavingGrades(true);
      setSaveMessage(null);
      
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: selectedStudent.id,
          ...gradeForm,
          semester: selectedStudent.semester
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaveMessage({ type: "success", text: "Grade saved successfully!" });
        // Refresh data
        await fetchCourseDetails();
        setIsEditModalOpen(false);
        setSelectedStudent(null);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save grade" });
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      setSaveMessage({ type: "error", text: "Failed to save grade" });
    } finally {
      setSavingGrades(false);
    }
  };

  // Calculate total marks for display
  const calculateTotal = () => {
    return gradeForm.classParticipation + gradeForm.midTerm + gradeForm.project + 
           gradeForm.finalTerm + gradeForm.assignment + gradeForm.quiz;
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
  const gradedCount = courseData?.enrollments?.filter((e) => e.grade?.isComplete)?.length || 0;
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
                  <th className="text-left text-gray-400 font-medium px-6 py-4">Grade</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-4">GPA</th>
                  <th className="text-center text-gray-400 font-medium px-6 py-4">Actions</th>
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
                      {enrollment.grade?.isComplete ? (
                        <div className="text-sm">
                          <span className="text-white font-medium">{enrollment.grade.obtainedMarks}/100</span>
                          <span className="text-gray-400 ml-2">({enrollment.grade.percentage?.toFixed(1)}%)</span>
                          <div className="text-xs text-gray-500">{enrollment.grade.letterGrade}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.grade?.isComplete ? (
                        <span className="text-white">{enrollment.grade.gpa?.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditGrade(enrollment)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition"
                      >
                        Edit
                      </button>
                    </td>
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

      {/* Grade Edit Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2d39] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Grades</h2>
                  <p className="text-gray-400">{selectedStudent.student.fullName} ({selectedStudent.student.studentId})</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`p-4 rounded-lg mb-6 ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-900/30 border border-green-600 text-green-400'
                    : 'bg-red-900/30 border border-red-600 text-red-400'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-6">
                {/* Grade Components */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Grade Components</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Class Participation (5 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={gradeForm.classParticipation}
                        onChange={(e) => handleGradeChange('classParticipation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Mid Term (20 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={gradeForm.midTerm}
                        onChange={(e) => handleGradeChange('midTerm', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Project (15 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="0.5"
                        value={gradeForm.project}
                        onChange={(e) => handleGradeChange('project', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Final Term (40 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={gradeForm.finalTerm}
                        onChange={(e) => handleGradeChange('finalTerm', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Assignment (10 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={gradeForm.assignment}
                        onChange={(e) => handleGradeChange('assignment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Quiz (10 marks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={gradeForm.quiz}
                        onChange={(e) => handleGradeChange('quiz', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Total and Preview */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Grade Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total Marks</p>
                      <p className="text-2xl font-bold text-white">{calculateTotal()}/100</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Percentage</p>
                      <p className="text-2xl font-bold text-indigo-400">{calculateTotal()}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Letter Grade</p>
                      <p className="text-2xl font-bold text-green-400">
                        {calculateTotal() >= 90 ? 'A+' : 
                         calculateTotal() >= 85 ? 'A' :
                         calculateTotal() >= 80 ? 'A-' :
                         calculateTotal() >= 75 ? 'B+' :
                         calculateTotal() >= 70 ? 'B' :
                         calculateTotal() >= 65 ? 'B-' :
                         calculateTotal() >= 60 ? 'C+' :
                         calculateTotal() >= 55 ? 'C' :
                         calculateTotal() >= 50 ? 'C-' :
                         calculateTotal() >= 45 ? 'D' : 'F'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={gradeForm.remarks}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Add any remarks about the student's performance..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGrade}
                    disabled={savingGrades}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
                  >
                    {savingGrades ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
