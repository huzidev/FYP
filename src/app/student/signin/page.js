"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Header from "../../../Component/Header";
import Eyebtn from "../../../Component/User/Eyebtn";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showEye, setShowEye] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { isAuthenticated, getDashboardRoute, USER_TYPES } = await import(
        "../../../lib/auth"
      );
      if (isAuthenticated()) {
        router.push(getDashboardRoute(USER_TYPES.STUDENT));
      }
    };
    checkAuth();
  }, [router]);

  const eyeToggle = (e) => {
    e.preventDefault();
    setShowEye(!showEye);
  };

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
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
    if (validate()) {
      try {
        // Import StudentService and auth utilities
        const { StudentService, ApiError } = await import("../../../lib/api");
        const { setCurrentUser, setToken, getDashboardRoute, USER_TYPES } =
          await import("../../../lib/auth");

        const credentials = {
          email: username,
          password: password,
        };

        const response = await StudentService.login(credentials);

        // The API returns { message: 'Login successful', data: {...}, token: '...' }
        // And baseFetch wraps it in { data: {...} }
        // So we need response.data.data to get the actual student data
        if (response.data && response.data.data && response.data.token) {
          // Set user data in localStorage
          setCurrentUser(response.data.data, USER_TYPES.STUDENT);

          // Store token from API response
          setToken(response.data.token);

          alert("Login successful!");

          // Redirect to student dashboard
          window.location.href = getDashboardRoute(USER_TYPES.STUDENT);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please try again.";

        if (error instanceof ApiError) {
          errorMessage = error.message || "Invalid credentials";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setErrors({ general: errorMessage });
        alert(errorMessage);
      }
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

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-[#1e1e26] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
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
                  />
                  <Eyebtn showEye={showEye} eyeToggle={eyeToggle} />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="text-center">
                <a
                  href="/student/forgot-password"
                  className="text-sm text-indigo-400"
                >
                  Forgot password?
                </a>
                <br />
                or
                <br />
                <a
                  href="/student/change-password"
                  className="text-sm text-indigo-400"
                >
                  Change Password
                </a>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Sign In
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
