"use client";
import { useState } from "react";

export default function AdminForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setError("");
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setStep(2);
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/admin/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setAdminId(data.adminId);
    setStep(3);
  };

  const resetPassword = async () => {
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    alert("Password reset successful");
    window.location.href = "/admin/signin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1d1d24]">
      <div className="bg-[#2d2d39] p-6 rounded-xl w-full max-w-md">
        <h2 className="text-white text-lg mb-4">Admin Forgot Password</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        {step === 1 && (
          <>
            <input
              className="w-full mb-3 p-2 rounded"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              className="w-full bg-indigo-600 p-2 text-white rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className="w-full mb-3 p-2 rounded"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-indigo-600 p-2 text-white rounded"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              className="w-full mb-3 p-2 rounded"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={resetPassword}
              className="w-full bg-green-600 p-2 text-white rounded"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
