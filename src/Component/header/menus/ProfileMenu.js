"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, ArrowLeft, Trash2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function ProfileMenu({ student, onBack }) {
  const router = useRouter();

  /* =======================
     IMAGE STATE (NEW)
  ======================= */
  const fileRef = useRef(null);
  const [profileImage, setProfileImage] = useState(
    student.profileImage || null,
  );
  const [publicId, setPublicId] = useState(student.profileImageId || null);
  const [uploading, setUploading] = useState(false);

  /* =======================
     EXISTING STATE (UNCHANGED)
  ======================= */
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: student.phone || "",
    address: student.address || "",
    department: student.department?.name || "",
  });

  const [firstLogin, setFirstLogin] = useState(student.firstLogin || null);
  const [currentSession, setCurrentSession] = useState(new Date());

  useEffect(() => {
    if (!student.firstLogin) {
      const now = new Date();
      setFirstLogin(now);
    }
    const interval = setInterval(() => setCurrentSession(new Date()), 1000);
    return () => clearInterval(interval);
  }, [student.firstLogin]);

  /* =======================
     IMAGE UPLOAD HANDLER (NEW)
  ======================= */

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Upload failed");

      setProfileImage(data.secure_url);
      setPublicId(data.public_id);

      // OPTIONAL: Save to DB
      await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: data.secure_url,
          profileImageId: data.public_id,
        }),
      });
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* =======================
     IMAGE DELETE HANDLER (NEW)
  ======================= */
  const handleDeleteImage = async () => {
    try {
      setProfileImage(null);
      setPublicId(null);

      await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: null,
          profileImageId: null,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) =>
    dayjs(date).format("dddd, MMMM D, YYYY h:mm:ss A");

  // ---------- Navigation ----------
  const handleChangePassword = () => router.push("/student/change-password");
  const handleForgotPassword = () => router.push("/student/forgot-password");

  // ---------- Profile Completion ----------
  const completion = Math.min(
    100,
    [student.phone, student.address, student.department?.name].filter(Boolean)
      .length * 33,
  );

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-[#1d1d24] text-gray-300 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <aside className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b] flex flex-col items-center">
          {/* ===== PROFILE IMAGE (NEW) ===== */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#1e1e26] flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} />
            )}

            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full"
            >
              <Camera size={14} />
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileRef}
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />

          {profileImage && (
            <button
              onClick={handleDeleteImage}
              className="mt-2 text-xs text-red-400 flex items-center gap-1"
            >
              <Trash2 size={14} /> Remove Photo
            </button>
          )}

          {uploading && (
            <p className="text-xs mt-2 text-blue-400">Uploading...</p>
          )}

          {/* EXISTING SIDEBAR CONTENT */}
          <h3 className="text-lg font-semibold text-white mt-4">
            {student.fullName}
          </h3>
          <p className="text-sm text-gray-400">ID: {student.studentId}</p>
          <span
            className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
              student.isActive
                ? "bg-green-900/40 text-green-400 border border-green-800"
                : "bg-red-900/40 text-red-400 border border-red-800"
            }`}
          >
            {student.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
          {/* Profile Completion */}
          <div className="w-full mt-6">
            <p className="text-xs text-gray-400 mb-1">Profile Completion</p>
            <div className="w-full bg-[#1e1e26] h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-400">{completion}%</p>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-3 space-y-6">
          {/* Profile Details */}
          <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Profile Details
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={student.fullName}
                  disabled
                  className="input-disabled"
                  placeholder="Full Name"
                />
                <input
                  value={student.email}
                  disabled
                  className="input-disabled"
                  placeholder="Email"
                />
                <input
                  value={student.studentId || ""}
                  disabled
                  className="input-disabled"
                  placeholder="Student ID"
                />
                <input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input"
                />
                <input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input"
                />
                <input
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="input"
                />

                <button
                  onClick={handleUpdateProfile}
                  className="md:col-span-2 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Update Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  {student.fullName}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span> {student.email}
                </p>
                <p>
                  <span className="text-gray-500">Student ID:</span>{" "}
                  {student.studentId}
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {student.phone || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Address:</span>{" "}
                  {student.address || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Department:</span>{" "}
                  {student.department?.name || "—"}
                </p>
              </div>
            )}
          </div>

          {/* Security Box */}
          <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
            <h2 className="text-lg font-semibold text-white mb-4">
              Security (CMS Password)
            </h2>
            <div className="flex gap-4">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
              >
                Change Password
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Forgot Password
              </button>
            </div>
          </div>

          {/* Login Activity */}
          <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
            <h2 className="text-lg font-semibold text-white mb-4">
              Login Activity
            </h2>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-500">First Login:</span>{" "}
                {firstLogin ? formatDate(firstLogin) : "—"}
              </p>
              <p>
                <span className="text-gray-500">Current Session:</span>{" "}
                {formatDate(currentSession)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
