"use client";
import { useState } from "react";

export default function ChangePassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState("");

  const verifyOldPassword = async () => {
    setError("");
    const res = await fetch("/api/admin/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setAdminId(data.adminId);
    setStep(2);
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    alert("Password changed successfully");
    window.location.href = "/admin/signin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1d1d24]">
      <div className="bg-[#2d2d39] p-6 rounded-xl w-full max-w-md">
        <h2 className="text-white text-lg mb-4">Change Password</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        {step === 1 && (
          <>
            <input
              className="w-full mb-3 p-2 rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full mb-3 p-2 rounded"
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button
              onClick={verifyOldPassword}
              className="w-full bg-indigo-600 p-2 rounded text-white"
            >
              Verify
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className="w-full mb-3 p-2 rounded"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              className="w-full mb-3 p-2 rounded"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={changePassword}
              className="w-full bg-green-600 p-2 rounded text-white"
            >
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
