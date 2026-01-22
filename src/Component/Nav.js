"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full py-4 fixed top-0 left-0 bg-transparent z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Logo width={100} height={50} className="cursor-pointer" />
          </Link>
          
        </div>

        
        <div className="relative text-white">
          <button
            onClick={() => setOpen(!open)}
            className=" font-medium hover:text-gray-300 focus:outline-none"
          >
            Sign In
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2">
              <Link
                href="/admin/signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
              <Link
                href="/staff/signin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Staff
              </Link>
              <Link
                href="/student/signin"
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
