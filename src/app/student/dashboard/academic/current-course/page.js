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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [grades, setGrades] = useState({});
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

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
      await fetchGrades(studentId, data.data);
    } catch (err) {
      toast.error("Failed to load current courses");
    }
  };

  /* ===================== FETCH GRADES ===================== */
  const fetchGrades = async (studentId, enrollments) => {
    try {
      const gradePromises = enrollments.map(enrollment => 
        fetch(`/api/grades?enrollmentId=${enrollment.id}`).then(res => res.json()).catch(() => ({ success: false, data: [] }))
      );
      
      const gradeResults = await Promise.all(gradePromises);
      const gradeMap = {};
      
      gradeResults.forEach((gradeData, index) => {
        if (gradeData.success && gradeData.data && gradeData.data.length > 0) {
          gradeMap[enrollments[index].id] = gradeData.data[0];
        }
      });
      
      setGrades(gradeMap);
    } catch (err) {
      console.error("Failed to load grades:", err);
      setGrades({}); // Set empty object on error
    }
  };

  /* ===================== VIEW GRADE ===================== */
  const handleViewGrade = (enrollment) => {
    const grade = grades[enrollment.id];
    if (grade && grade.isComplete) {
      setSelectedGrade({ ...grade, enrollment });
      setIsGradeModalOpen(true);
    }
  };

  /* ===================== VIEW COURSE DETAILS ===================== */
  const handleViewCourse = async (enrollment) => {
    setSelectedCourse(enrollment);
    setLoading(true);
    
    try {
      // Fetch detailed course info including teacher
      const res = await fetch(`/api/enrollments/${enrollment.id}`);
      const data = await res.json();
      
      if (data.success) {
        setCourseDetails(data.data);
      }
    } catch (err) {
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
      setIsModalOpen(true);
    }
  };

  /* ===================== HELPER FUNCTIONS ===================== */
  const formatDay = (dayOfWeek) => {
    if (!dayOfWeek) return 'TBA';
    return dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase();
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime || !endTime) return 'TBA';
    
    const formatTimeString = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
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
            {courses.map((e) => {
              const hasGrades = grades[e.id] && grades[e.id].isComplete === true;
              
              return (
                <div key={e.id} className="bg-[#1e1e26] p-4 rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-indigo-400">{e.subject.code}</p>
                      <p className="text-white font-semibold">{e.subject.name}</p>
                      <p className="text-gray-400 text-sm">
                        Semester {e.semester} • Credits {e.subject.creditHours}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCourse(e)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => hasGrades && handleViewGrade(e)}
                        disabled={!hasGrades}
                        className={`px-3 py-1.5 text-sm rounded transition ${
                          hasGrades 
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2d39] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Course Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {courseDetails && (
                <div className="space-y-6">
                  {/* Basic Course Info */}
                  <div className="bg-[#1e1e26] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Course Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Course Code</p>
                        <p className="text-white font-medium">{courseDetails.subject.code}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Course Name</p>
                        <p className="text-white font-medium">{courseDetails.subject.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Credit Hours</p>
                        <p className="text-white font-medium">{courseDetails.subject.creditHours}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Semester</p>
                        <p className="text-white font-medium">{courseDetails.semester || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {courseDetails.subject.description && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm">Description</p>
                        <p className="text-white">{courseDetails.subject.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Schedule Info */}
                  <div className="bg-[#1e1e26] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Class Schedule</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Day</p>
                        <p className="text-white font-medium">
                          {formatDay(courseDetails.subject.dayOfWeek)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Time</p>
                        <p className="text-white font-medium">
                          {formatTime(courseDetails.subject.startTime, courseDetails.subject.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Classroom</p>
                        <p className="text-white font-medium">
                          {courseDetails.subject.classroom || 'TBA'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  {courseDetails.teacher && (
                    <div className="bg-[#1e1e26] p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-3">Instructor</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Name</p>
                          <p className="text-white font-medium">{courseDetails.teacher.fullName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Staff ID</p>
                          <p className="text-white font-medium">{courseDetails.teacher.staffId}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white font-medium">{courseDetails.teacher.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Result Button */}
                  <div className="flex justify-center pt-4">
                    {grades[selectedCourse.id]?.isComplete === true ? (
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          router.push(`/student/dashboard/academic/grades/${selectedCourse.id}`);
                        }}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        View Result
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-6 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                      >
                        Result Not Available
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Details Modal */}
      {isGradeModalOpen && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2d39] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Grade Details</h2>
                <button
                  onClick={() => setIsGradeModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Course Info */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Course Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Course</p>
                      <p className="text-white font-medium">{selectedGrade.enrollment.subject.code} - {selectedGrade.enrollment.subject.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Credit Hours</p>
                      <p className="text-white font-medium">{selectedGrade.enrollment.subject.creditHours}</p>
                    </div>
                  </div>
                </div>

                {/* Grade Breakdown */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Grade Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Class Participation (5 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.classParticipation || 0}/5</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Assignment (10 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.assignment || 0}/10</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Quiz (10 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.quiz || 0}/10</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Project (15 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.project || 0}/15</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Midterm (20 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.midTerm || 0}/20</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">Final Term (40 marks)</span>
                      <span className="text-white font-medium">{selectedGrade.finalTerm || 0}/40</span>
                    </div>
                  </div>
                </div>

                {/* Final Grade */}
                <div className="bg-[#1e1e26] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Final Grade</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#2d2d39] p-3 rounded">
                      <p className="text-gray-400 text-sm">Total Marks</p>
                      <p className="text-2xl font-bold text-white">{selectedGrade.obtainedMarks || 0}/100</p>
                    </div>
                    <div className="bg-[#2d2d39] p-3 rounded">
                      <p className="text-gray-400 text-sm">Percentage</p>
                      <p className="text-2xl font-bold text-white">{selectedGrade.percentage || 0}%</p>
                    </div>
                    <div className="bg-[#2d2d39] p-3 rounded">
                      <p className="text-gray-400 text-sm">Grade</p>
                      <p className="text-3xl font-bold text-green-400">{selectedGrade.letterGrade || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">GPA</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedGrade.gpa || 0.0}/4.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentCoursesPage;
