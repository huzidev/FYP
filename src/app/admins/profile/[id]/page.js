"use client";

import Header from "@/Component/Header";
import { AdminService, ApiError } from "@/lib/api";
import { getCurrentUser, verifyAuth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const checkAuth = () => {
      const { valid } = verifyAuth();
      if (!valid) {
        router.push("/");
        return;
      }
    };

    checkAuth();
    fetchAdmin();
  }, [params.id, router]);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getById(params.id);
      setAdmin(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching admin:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!admin) return;
    
    try {
      setIsUpdating(true);
      await AdminService.update(admin.id, {
        isActive: !admin.isActive,
      });
      await fetchAdmin();
    } catch (err) {
      console.error("Error updating admin:", err);
      alert("Failed to update admin status");
    } finally {
      setIsUpdating(false);
    }
  };

  const canEdit = () => {
    if (!currentUser || !admin) return false;
    // Super admin can't be edited
    if (admin.role === "SUPER_ADMIN") return false;
    // Current user can't edit themselves (they should view profile)
    if (admin.id === currentUser.id) return false;
    // Admin can edit other admins but not super admins
    return currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-red-400">{error || "Admin not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
            <p className="text-gray-400">{admin.fullName}</p>
          </div>
          <div className="flex gap-3">
            {canEdit() && (
              <button
                onClick={handleToggleActive}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg transition ${
                  admin.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white disabled:opacity-50`}
              >
                {isUpdating ? "Updating..." : admin.isActive ? "Deactivate" : "Activate"}
              </button>
            )}
            {canEdit() && (
              <button
                onClick={() => router.push(`/admins/edit/${admin.id}`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">ID</p>
                <p className="text-white font-medium">{admin.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-medium">{admin.fullName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{admin.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{admin.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white font-medium">{admin.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {admin.role}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    admin.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {admin.lastLoginAt && (
                <div>
                  <p className="text-gray-400 text-sm">Last Login</p>
                  <p className="text-white font-medium">
                    {new Date(admin.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Created At</p>
                <p className="text-white font-medium">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
