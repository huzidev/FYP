"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { toast } from "react-toastify";
import Header from "./Header";

const ForgotPasswordComponent = ({ userType }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        userType === "admin"
          ? "/api/admin/forgot-password"
          : userType === "staff"
          ? "/api/staff/forgot-password"
          : "/api/students/forgot-password";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to send OTP";
        toast.error(typeof errorMsg === "string" ? errorMsg : "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error("Error sending OTP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        userType === "admin"
          ? "/api/admin/verify-reset-otp"
          : userType === "staff"
          ? "/api/staff/verify-reset-otp"
          : "/api/students/verify-reset-otp";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Invalid OTP";
        toast.error(typeof errorMsg === "string" ? errorMsg : "Invalid OTP");
        return;
      }

      setUserId(data.adminId || data.staffId || data.studentId);
      toast.success("OTP verified");
      setStep(3);
    } catch (error) {
      toast.error("Error verifying OTP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Password is required");
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

    setIsLoading(true);
    try {
      const endpoint =
        userType === "admin"
          ? "/api/admin/reset-password"
          : userType === "staff"
          ? "/api/staff/reset-password"
          : "/api/students/reset-password";

      const bodyData = { newPassword };
      if (userType === "admin") bodyData.adminId = userId;
      else if (userType === "staff") bodyData.staffId = userId;
      else bodyData.studentId = userId;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to reset password";
        toast.error(typeof errorMsg === "string" ? errorMsg : "Failed to reset password");
        return;
      }

      toast.success("Password reset successful");
      setTimeout(() => {
        router.push(`/${userType}/signin`);
      }, 1500);
    } catch (error) {
      toast.error("Error resetting password");
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
            <h1 className="text-white font-bold text-2xl mb-2">Forgot Password?</h1>
            <p className="text-gray-400 text-sm mb-8 capitalize">
              Reset your {userType} account password
            </p>

            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-4 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    placeholder="000000"
                    maxLength="6"
                  />
                  <p className="text-gray-500 text-xs mt-2">Check your email for the OTP</p>
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-4 text-gray-500" size={20} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm font-semibold block mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-4 text-gray-500" size={20} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1f] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={resetPassword}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
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

export default ForgotPasswordComponent;
