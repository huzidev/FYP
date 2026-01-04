"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window !== "undefined") {
        const { isAuthenticated, getCurrentUser } = await import("../lib/auth");
        const authenticated = isAuthenticated();
        setIsLoggedIn(authenticated);
        if (authenticated) {
          setUser(getCurrentUser());
        }
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    const { logout } = await import("../lib/auth");
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <>
      <header className="w-full bg-[#25252b] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-white cursor-pointer font-extrabold text-2xl">
              SmiConnect
            </h1>
          </Link>

          {isLoggedIn && user && (
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Welcome, {user.fullName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="w-full h-[2px] bg-black"></div>
    </>
  );
}
