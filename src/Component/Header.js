"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window !== 'undefined') {
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
      <header className="w-full fixed top-0 left-0 bg-transparent z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link href="/">
            <Logo width={60} height={50} className="cursor-pointer" />
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
