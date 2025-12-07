"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Header from "../../../Component/Header";
import Eyebtn from "../../../Component/User/Eyebtn";
import { AdminService, ApiError } from "../../../lib/api";
import { setCurrentUser, USER_TYPES } from "../../../lib/auth";

const SignIn = () => {
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
      const response = await AdminService.login({ email, password });
      
      // The API returns { message: 'Login successful', data: {...}, token: '...' }
      // And baseFetch wraps it in { data: {...} }
      if (response.data && response.data.data && response.data.token) {
        // Store user data using auth utility
        setCurrentUser(response.data.data, USER_TYPES.ADMIN);
        
        // Store token
        const { setToken } = await import("../../../lib/auth");
        setToken(response.data.token);
        
        // Redirect after successful login
        router.push("/admin/dashboard");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#1d1d24] px-4">
        <div className="box max-w-md w-full">
          <div
            className="
              relative bg-[#2d2d39] border-8 border-[#25252b] rounded-xl 
              p-6 shadow-2xl
            "
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-300 font-semibold text-base">
                Login to your account
              </p>
              <FaUserCircle className="text-indigo-400" size={50} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 mt-6"
            >
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showEye ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <Eyebtn showEye={showEye} eyeToggle={eyeToggle} />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </a>
                <br />
                or
                <br />
                <a
                  href="#"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Change Password
                </a>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
