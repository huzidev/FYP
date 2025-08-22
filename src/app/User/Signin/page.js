"use client";
import React, { useState } from "react";
import Eyebtn from "../../../Component/User/Eyebtn";
import { FaUserCircle } from "react-icons/fa";
import Header from "../../../Component/Header";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showEye, setShowEye] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("✅ Username:", username);
      console.log("✅ Password:", password);
      alert("Login successful!");
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#1d1d24] px-4">
        <div className="box max-w-md w-full cursor-pointer group">
          <div
            className="
            relative bg-[#2d2d39] border-8 border-[#25252b] rounded-xl 
            p-6 shadow-2xl 
            max-h-28 overflow-hidden 
            transition-all duration-700 ease-in-out
            group-hover:max-h-[800px]
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
              className="space-y-6 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            >
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
                  href="#"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
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
