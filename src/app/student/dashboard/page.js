"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../../Component/Header";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { isAuthenticated, getCurrentUser, USER_TYPES } = await import(
          "../../../lib/auth"
        );

        if (!isAuthenticated()) {
          router.push("/student/signin");
          return;
        }

        const user = getCurrentUser();
        if (user.userType !== USER_TYPES.STUDENT) {
          router.push("/");
          return;
        }

        setStudent(user);
        setLoading(false);
      } catch (error) {
        console.error("Error loading student data:", error);
        router.push("/student/signin");
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#1d1d24] text-gray-300">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-400">Welcome back, {student.fullName}</p>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Profile Information
            </h3>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-gray-500 font-medium">Student ID:</span>{" "}
                {student.studentId}
              </p>
              <p>
                <span className="text-gray-500 font-medium">Email:</span>{" "}
                {student.email}
              </p>
              <p>
                <span className="text-gray-500 font-medium">Phone:</span>{" "}
                {student.phone}
              </p>
              {student.gender && (
                <p>
                  <span className="text-gray-500 font-medium">Gender:</span>{" "}
                  {student.gender}
                </p>
              )}
              {student.address && (
                <p>
                  <span className="text-gray-500 font-medium">Address:</span>{" "}
                  {student.address}
                </p>
              )}
              {student.department && (
                <p>
                  <span className="text-gray-500 font-medium">Department:</span>{" "}
                  {student.department.name}
                </p>
              )}
            </div>
          </div>

          {/* Academic Status Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Academic Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm font-medium">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold text-white ${
                    student.isActive ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {student.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-sm">
                <span className="text-gray-500 font-medium">Semester:</span>{" "}
                {student.currentSemester}
              </p>
              <p className="text-sm">
                <span className="text-gray-500 font-medium">Session:</span>{" "}
                {student.session}
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              {["View Grades", "Check Fees", "Update Profile"].map((action) => (
                <button
                  key={action}
                  className="w-full text-left px-4 py-2 bg-[#1e1e26] hover:bg-[#363645] text-gray-300 rounded transition-all duration-200 border border-transparent hover:border-[#4a4a5a]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Enrollments Section */}
        {student.enrollments?.length > 0 && (
          <section className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Current Enrollments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.enrollments.map((enrollment, index) => (
                <div
                  key={index}
                  className="bg-[#1e1e26] p-4 rounded border border-[#25252b]"
                >
                  <h4 className="text-white font-medium mb-1">
                    {enrollment.subject?.name}
                  </h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Code: {enrollment.subject?.code}</p>
                    <p>Credits: {enrollment.subject?.creditHours}</p>
                    {enrollment.grade && (
                      <p className="text-indigo-400 font-medium mt-2">
                        Grade: {enrollment.grade.grade} (
                        {enrollment.grade.points} pts)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fees Section */}
        {student.fees?.length > 0 && (
          <section className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Fee Status
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {student.fees.map((fee, index) => (
                <div
                  key={index}
                  className="bg-[#1e1e26] p-4 rounded border border-[#25252b] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">
                      Amount: ${fee.amount}
                    </p>
                    <div className="text-sm text-gray-400">
                      <p>Paid: ${fee.paidAmount}</p>
                      <p>
                        Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold text-center w-fit ${
                      fee.status === "PAID"
                        ? "bg-green-900/40 text-green-400 border border-green-800"
                        : fee.status === "PARTIAL"
                        ? "bg-yellow-900/40 text-yellow-400 border border-yellow-800"
                        : "bg-red-900/40 text-red-400 border border-red-800"
                    }`}
                  >
                    {fee.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
