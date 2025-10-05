"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 bg-transparent z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <motion.h1 className="text-2xl font-extrabold text-red-600 relative overflow-hidden">
            <span className="relative inline-block">
              smiKonnect
              <motion.span
                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </span>
          </motion.h1>
        </div>

        
        <div className="relative text-black">
          <button
            onClick={() => setOpen(!open)}
            className=" font-medium hover:text-gray-300 focus:outline-none"
          >
            Sign In
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2">
              <Link
                href="/Admin/Signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
              <Link
                href="/Admission/Signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Admission
              </Link>
              <Link
                href="/User/Signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Student
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
