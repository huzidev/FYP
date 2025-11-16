"use client";
import Navbar from "@/Component/Nav";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Page = () => {
  const announcements = [
    {
      title: "Admissions Open",
      date: "Oct 10, 2025",
      desc: "Fall 2025 admissions are now open. Apply before Nov 30.",
    },
    {
      title: "Fee Submission",
      date: "Oct 15, 2025",
      desc: "Last date for semester fee submission is Oct 25.",
    },
    {
      title: "Holiday Notice",
      date: "Oct 20, 2025",
      desc: "Institute will remain closed on Oct 25 for public holiday.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and redirect to appropriate dashboard
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const { isAuthenticated, getCurrentUser, getDashboardRoute } = await import("../lib/auth");
        if (isAuthenticated()) {
          const user = getCurrentUser();
          if (user && user.userType) {
            window.location.href = getDashboardRoute(user.userType);
          }
        }
      }
    };
    checkAuth();

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="text-white bg-[#25252b] min-h-screen flex flex-col">
      <Navbar />

      {/* --------Portal------ */}
      <section className="flex flex-col items-center justify-center flex-grow text-center py-20 px-6 text-white bg-[#25252b]">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Institute CMS Portal
        </h1>
        <p className="text-gray-100 max-w-2xl mb-8">
          A centralized platform to manage admissions, students, teachers, fees,
          attendance, and more. Designed to simplify academic administration.
        </p>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="px-8 py-4 bg-black hover:bg-gray-800 rounded-lg text-lg font-semibold transition"
          >
            Login to Portal
          </button>

          {showOptions && (
            <div className="absolute left-0 right-0 mt-2 bg-[#2f2f37] rounded-lg shadow-lg p-0 flex flex-col divide-y divide-gray-600">
              <Link
                href="/admission/signin"
                className="px-6 py-3 text-white font-semibold hover:bg-[#3a3a42] transition"
              >
                Admission Login
              </Link>
              <Link
                href="/user/signin"
                className="px-6 py-3 text-white font-semibold hover:bg-[#3a3a42] transition"
              >
                Student Login
              </Link>
              <Link
                href="/admin/signin"
                className="px-6 py-3 text-white font-semibold hover:bg-[#3a3a42] transition"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* API Test & Quick Links */}
      <section className="bg-blue-900 py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">🚀 System Ready!</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            The university management system is fully configured with database, API routes, 
            and sample data. Test the system or login with the credentials below.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* API Test */}
            <div className="bg-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔧 API Test</h3>
              <p className="text-blue-100 text-sm mb-4">
                Verify database connection and API functionality
              </p>
              <Link 
                href="/test" 
                className="inline-block px-6 py-2 bg-white text-blue-900 rounded font-semibold hover:bg-gray-100 transition"
              >
                Test API →
              </Link>
            </div>

            {/* Sample Logins */}
            <div className="bg-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔑 Test Logins</h3>
              <div className="text-sm text-blue-100 space-y-1 mb-4">
                <div><strong>Admin:</strong> admin@university.edu</div>
                <div><strong>Staff:</strong> john.teacher@university.edu</div>
                <div><strong>Student:</strong> alice.student@university.edu</div>
                <div className="text-xs">(Password: admin123, staff123, student123)</div>
              </div>
            </div>
          </div>

          <div className="bg-green-100 text-green-800 rounded-lg p-4 text-sm">
            <strong>✅ Database Status:</strong> Connected to Prisma Cloud Database | 
            <strong> Sample Data:</strong> Loaded | 
            <strong> API Routes:</strong> Active
          </div>
        </div>
      </section>

      {/* --------About------ */}
      <section className="bg-[#2f2f37] py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">About Our Portal</h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          This portal provides a seamless experience for managing academic
          operations. Students can enroll and pay fees, teachers can manage
          classes and attendance, and admins have full control over the
          institution’s records. Everything is digital, secure, and efficient.
        </p>
      </section>

      {/* ---------Features-------*/}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Student Enrollment",
            desc: "Easy enrollment process for new and existing students.",
          },
          {
            title: "Fee Management",
            desc: "Track fees, installments, and generate receipts online.",
          },
          {
            title: "Attendance Tracking",
            desc: "Teachers can mark and monitor student attendance effortlessly.",
          },
          {
            title: "Class Management",
            desc: "Organize schedules, subjects, and performance records.",
          },
          {
            title: "Secure Access",
            desc: "Role-based authentication ensures safe data handling.",
          },
          {
            title: "Reports & Analytics",
            desc: "Generate reports for fees, attendance, and academics.",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-[#2f2f37] p-8 rounded-xl shadow hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#1f1f24] py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Latest Announcements
        </h2>

        <div className="max-w-3xl mx-auto relative overflow-hidden">
          {/* -----Slider----- */}
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {announcements.map((note, idx) => (
              <div
                key={idx}
                className="min-w-full bg-[#2f2f37] p-6 rounded-lg shadow text-center"
              >
                <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{note.date}</p>
                <p className="text-gray-300">{note.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4 space-x-2">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === current ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* -----Contact----- */}
      <section className="bg-[#2f2f37] py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          Have questions? Reach out to us for help regarding admissions, portal
          access, or general inquiries.
        </p>
        <div className="text-gray-300">
          <p>Email: support@smiKonnect.com</p>
          <p>Phone: +92 300 1234567</p>
          <p>Address: II Chundrigar Road, Karachi, Pakistan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 border-t border-gray-700">
        © {new Date().getFullYear()} smiKonnect. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
