"use client";

import React, { useState } from "react";
import Eyebtn from "../../../Component/User/Eyebtn";
import { FaUserCircle } from "react-icons/fa";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showEye, setShowEye] = useState(false);

  const eyeToggle = (e) => {
    e.preventDefault();
    setShowEye(!showEye);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-300 to-pink-200 px-4 text-black">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <FaUserCircle className="mx-auto text-indigo-600" size={60} />
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition"
              placeholder="Enter your username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showEye ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm transition"
                placeholder="Enter your password"
              />
              <Eyebtn showEye={showEye} eyeToggle={eyeToggle} />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
