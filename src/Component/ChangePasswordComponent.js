"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { toast } from "react-toastify";
import Header from "./Header";
import Eyebtn from "./User/Eyebtn";

const ChangePasswordComponent = ({ userType }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const verifyOldPassword = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!oldPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        userType === "admin"
          ? "/api/admin/verify-password"
          : userType === "staff"
          ? "/api/staff/verify-password"
          : "/api/students/verify-password";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid email or password");
        return;
      }

      setUserId(data.adminId || data.staffId || data.studentId);
      toast.success("Verification successful");
      setStep(2);
    } catch (error) {
      toast.error("Error verifying password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("New password is required");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        userType === "admin"
          ? "/api/admin/change-password"
          : userType === "staff"
          ? "/api/staff/change-password"
          : "/api/students/change-password";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: userId, staffId: userId, studentId: userId, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      setTimeout(() => {
        router.push(`/${userType}/signin`);
      }, 1500);
    } catch (error) {
      toast.error("Error changing password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#1d1d24] px-4 py-8">
        <div className="w-full max-w-md">
          <div className="relative bg-gradient-to-br from-[#2d2d39] to-[#25252b] border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white font-bold text-2xl mb-2">Change Password</h1>
            <p className="text-gray-400 text-sm mb-8 capitalize">
              Update your {userType} account password
            </p>

            {/* Step 1: Verify Old Password */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition"
                    >
                      <Eyebtn show={showOldPassword} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={verifyOldPassword}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                      Verifying...
                    </>
                  ) : (
                    "Verify Password"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Set New Password */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition"
                    >
                      <Eyebtn show={showNewPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition"
                    >
                      <Eyebtn show={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={changePassword}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            )}

            {/* Back to Sign In */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <Link
                href={`/${userType}/signin`}
                className="text-gray-400 hover:text-blue-400 transition text-sm font-semibold"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordComponent;
