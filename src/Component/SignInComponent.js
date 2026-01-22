"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { toast } from "react-toastify";
import Header from "./Header";
import Eyebtn from "./User/Eyebtn";

const SignInComponent = ({ userType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEye, setShowEye] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const eyeToggle = (e) => {
    e.preventDefault();
    setShowEye(!showEye);
  };

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const { AdminService, StaffService, StudentService, ApiError } = await import(
        "../lib/api"
      );
      const { setCurrentUser, setToken, getDashboardRoute, USER_TYPES } = await import(
        "../lib/auth"
      );

      let service;
      let userTypeEnum;

      if (userType === "admin") {
        service = AdminService;
        userTypeEnum = USER_TYPES.ADMIN;
      } else if (userType === "staff") {
        service = StaffService;
        userTypeEnum = USER_TYPES.STAFF;
      } else if (userType === "student") {
        service = StudentService;
        userTypeEnum = USER_TYPES.STUDENT;
      }

      const response = await service.login({ email, password });

      if (response.data && response.data.data && response.data.token) {
        setCurrentUser(response.data.data, userTypeEnum);
        setToken(response.data.token);

        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} login successful!`);

        setTimeout(() => {
          router.push(getDashboardRoute(userTypeEnum));
        }, 500);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPasswordPath = `/${userType}/forgot-password`;
  const changePasswordPath = `/${userType}/change-password`;

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#1d1d24] px-4 py-8">
        <div className="box w-full max-w-md">
          <div className="relative bg-gradient-to-br from-[#2d2d39] to-[#25252b] border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-white font-bold text-2xl">Welcome</h1>
                <p className="text-gray-400 text-sm capitalize">
                  Sign in to {userType} account
                </p>
              </div>
              <FaUserCircle className="text-blue-500 text-5xl" />
            </div>

            {errors.general && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-6">
                <p className="text-red-300 text-sm font-semibold">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1f] border ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    } text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="text-gray-300 text-sm font-semibold block mb-2">
                  Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type={showEye ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg bg-[#1a1a1f] border ${
                      errors.password ? "border-red-500" : "border-gray-600"
                    } text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition`}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={eyeToggle}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition"
                  >
                    <Eyebtn show={showEye} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Forgot & Change Password Links */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700 gap-2">
              <Link
                href={forgotPasswordPath}
                className="flex-1 text-center text-gray-400 hover:text-blue-400 transition text-sm font-semibold"
              >
                Forgot Password?
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href={changePasswordPath}
                className="flex-1 text-center text-gray-400 hover:text-blue-400 transition text-sm font-semibold"
              >
                Change Password
              </Link>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Secure login • All data encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInComponent;
