"use client";

import Header from "@/Component/Header";
import { ApiError, StudentService } from "@/lib/api";
import { verifyAuth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const { valid } = verifyAuth();
      if (!valid) {
        router.push("/");
        return;
      }
    };

    checkAuth();
    fetchStudent();
  }, [params.id, router]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await StudentService.getById(params.id);
      setStudent(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching student:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch student");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!student) return;
    
    try {
      setIsUpdating(true);
      await StudentService.update(student.id, {
        isActive: !student.isActive,
      });
      await fetchStudent();
    } catch (err) {
      console.error("Error updating student:", err);
      alert("Failed to update student status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-red-400">{error || "Student not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      <div className="container mx-auto px-6 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Profile</h1>
            <p className="text-gray-400">{student.fullName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleActive}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg transition ${
                student.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white disabled:opacity-50`}
            >
              {isUpdating ? "Updating..." : student.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => router.push(`/students/edit/${student.id}`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Student ID</p>
                <p className="text-white font-medium">{student.studentId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-medium">{student.fullName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{student.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white font-medium">{student.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Academic Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Department</p>
                <p className="text-white font-medium">{student.department?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-white font-medium">{student.level}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    student.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {student.dateOfBirth && (
                <div>
                  <p className="text-gray-400 text-sm">Date of Birth</p>
                  <p className="text-white font-medium">
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
