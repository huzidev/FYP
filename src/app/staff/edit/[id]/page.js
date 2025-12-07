"use client";

import Header from "@/Component/Header";
import { ApiError, StaffService } from "@/lib/api";
import { verifyAuth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      
      setFormData({
        fullName: response.data.data.fullName || "",
        email: response.data.data.email || "",
        phone: response.data.data.phone || "",
        address: response.data.data.address || "",
        role: response.data.data.role || "TEACHER",
        salary: response.data.data.salary?.toString() || "",
        hireDate: response.data.data.hireDate
          ? new Date(response.data.data.hireDate).toISOString().split("T")[0]
          : "",
      });
      
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hireDate: formData.hireDate || undefined,
      };
      
      await StaffService.update(params.id, updateData);
      router.push(`/staff/profile/${params.id}`);
    } catch (err) {
      console.error("Error updating staff:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update staff");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!staff) return;
    
    try {
      setSaving(true);
      await StaffService.update(params.id, {
        isActive: !staff.isActive,
      });
      await fetchStaff();
    } catch (err) {
      console.error("Error updating staff:", err);
      alert("Failed to update staff status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div className="min-h-screen bg-[#1d1d24] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Staff</h1>
            <p className="text-gray-400">{staff?.fullName}</p>
          </div>
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={`px-4 py-2 rounded-lg transition ${
              staff?.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white disabled:opacity-50`}
          >
            {saving ? "Updating..." : staff?.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#2d2d39] rounded-lg p-6 border border-[#25252b]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="TEACHER">Teacher</option>
                <option value="ADMISSION">Admission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hire Date
              </label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => router.push(`/staff/profile/${params.id}`)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-[#25252b] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
