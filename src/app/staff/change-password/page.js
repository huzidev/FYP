"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffChangePassword() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [staffId, setstaffId] = useState(null);
  const [error, setError] = useState("");

  /* STEP 1: VERIFY EMAIL + OLD PASSWORD */
  const verifyOldPassword = async () => {
    setError("");

    const res = await fetch("/api/staff/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setstaffId(data.staffId);
    setStep(2);
  };

  /* STEP 2: CHANGE PASSWORD */
  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/staff/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        oldPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    alert("Password updated successfully");

    // ✅ REDIRECT TO SIGN-IN
    router.push("/staff/signin");
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
              className="w-full bg-indigo-600 p-2 text-white rounded"
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
              onClick={updatePassword}
              className="w-full bg-green-600 p-2 text-white rounded"
            >
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
