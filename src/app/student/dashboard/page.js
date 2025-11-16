"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../Component/Header";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { isAuthenticated, getCurrentUser, USER_TYPES } = await import("../../../lib/auth");
        
        if (!isAuthenticated()) {
          router.push("/user/signin");
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
        router.push("/user/signin");
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-400">Welcome back, {student.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Info Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
            <div className="space-y-2">
              <p className="text-gray-300"><span className="font-medium">Student ID:</span> {student.studentId}</p>
              <p className="text-gray-300"><span className="font-medium">Email:</span> {student.email}</p>
              <p className="text-gray-300"><span className="font-medium">Phone:</span> {student.phone}</p>
              {student.gender && (
                <p className="text-gray-300"><span className="font-medium">Gender:</span> {student.gender}</p>
              )}
              {student.address && (
                <p className="text-gray-300"><span className="font-medium">Address:</span> {student.address}</p>
              )}
              {student.department && (
                <p className="text-gray-300"><span className="font-medium">Department:</span> {student.department.name}</p>
              )}
            </div>
          </div>

          {/* Academic Status Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Academic Status</h3>
            <div className="space-y-2">
              <p className="text-gray-300"><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${student.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="text-gray-300"><span className="font-medium">Semester:</span> {student.currentSemester}</p>
              <p className="text-gray-300"><span className="font-medium">Session:</span> {student.session}</p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-[#1e1e26] text-gray-300 rounded hover:bg-[#25252b] transition-colors">
                View Grades
              </button>
              <button className="w-full text-left px-3 py-2 bg-[#1e1e26] text-gray-300 rounded hover:bg-[#25252b] transition-colors">
                Check Fees
              </button>
              <button className="w-full text-left px-3 py-2 bg-[#1e1e26] text-gray-300 rounded hover:bg-[#25252b] transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Enrollments Section */}
        {student.enrollments && student.enrollments.length > 0 && (
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b] mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Enrollments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.enrollments.map((enrollment, index) => (
                <div key={index} className="bg-[#1e1e26] p-4 rounded">
                  <h4 className="text-white font-medium">{enrollment.subject?.name}</h4>
                  <p className="text-gray-400 text-sm">Code: {enrollment.subject?.code}</p>
                  <p className="text-gray-400 text-sm">Credit Hours: {enrollment.subject?.creditHours}</p>
                  {enrollment.grade && (
                    <p className="text-gray-400 text-sm">Grade: {enrollment.grade.grade} ({enrollment.grade.points} points)</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fees Section */}
        {student.fees && student.fees.length > 0 && (
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Fee Status</h3>
            <div className="space-y-4">
              {student.fees.map((fee, index) => (
                <div key={index} className="bg-[#1e1e26] p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">Amount: ${fee.amount}</p>
                      <p className="text-gray-400 text-sm">Paid: ${fee.paidAmount}</p>
                      <p className="text-gray-400 text-sm">Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      fee.status === 'PAID' ? 'bg-green-600' : 
                      fee.status === 'PARTIAL' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;