"use client";

import Header from "@/Component/Header";
import { ApiError, StaffService } from "@/lib/api";
import { verifyAuth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState(null);
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
    fetchStaff();
  }, [params.id, router]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await StaffService.getById(params.id);
      setStaff(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch staff");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!staff) return;
    
    try {
      setIsUpdating(true);
      await StaffService.update(staff.id, {
        isActive: !staff.isActive,
      });
      await fetchStaff();
    } catch (err) {
      console.error("Error updating staff:", err);
      alert("Failed to update staff status");
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

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-red-400">{error || "Staff not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      <div className="container mx-auto px-6 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Staff Profile</h1>
            <p className="text-gray-400">{staff.fullName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleActive}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg transition ${
                staff.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white disabled:opacity-50`}
            >
              {isUpdating ? "Updating..." : staff.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => router.push(`/staff/edit/${staff.id}`)}
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
                <p className="text-gray-400 text-sm">Staff ID</p>
                <p className="text-white font-medium">{staff.staffId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-medium">{staff.fullName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{staff.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{staff.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white font-medium">{staff.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Employment Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {staff.role}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    staff.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {staff.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {staff.salary && (
                <div>
                  <p className="text-gray-400 text-sm">Salary</p>
                  <p className="text-white font-medium">${staff.salary}</p>
                </div>
              )}
              {staff.hireDate && (
                <div>
                  <p className="text-gray-400 text-sm">Hire Date</p>
                  <p className="text-white font-medium">
                    {new Date(staff.hireDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {staff.lastLoginAt && (
                <div>
                  <p className="text-gray-400 text-sm">Last Login</p>
                  <p className="text-white font-medium">
                    {new Date(staff.lastLoginAt).toLocaleString()}
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
