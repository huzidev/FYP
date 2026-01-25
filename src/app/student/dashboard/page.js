"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  CreditCard,
  Calendar,
  Info,
  FileText,
} from "lucide-react";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } = await import(
        "../../../lib/auth"
      );

      if (!isAuthenticated()) {
        router.replace("/student/signin");
        return;
      }

      const user = getCurrentUser();
      if (!user || user.userType !== USER_TYPES.STUDENT) {
        router.replace("/student/signin");
        return;
      }

      setStudent(user);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  if (!student) return null;

  const generateProgramCode = (departmentName = "") => {
    if (!departmentName) return "—";
    const initials = departmentName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return `BS${initials}`;
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    setStudent(null);
    router.replace("/student/signin");
  };

  const navCards = [
    {
      title: "Academic",
      items: [
        { name: "Current Courses", link: "#" },
        { name: "Program Syllabus", link: "#" },
        { name: "Attendance Report", link: "#" },
        { name: "Grade History / Transcript", link: "/student/dashboard/transcript" },
        { name: "PLO/CLO Attainment", link: "#" },
        { name: "Program Sheet", link: "#" },
      ],
      icon: <BookOpen size={18} />,
    },
    {
      title: "Finance",
      items: [
        { name: "Student Fee Bill", link: "#" },
        { name: "Online Fee Payment", link: "#" },
        { name: "Fee Statement", link: "#" },
      ],
      icon: <CreditCard size={18} />,
    },
    {
      title: "Resources",
      items: [
        { name: "Search KIET Library", link: "#" },
        { name: "Digital Library", link: "#" },
        { name: "Book Issued", link: "#" },
      ],
      icon: <Info size={18} />,
    },
    {
      title: "Admin/Schedule",
      items: [
        { name: "Self Registration", link: "#" },
        { name: "Class Schedule", link: "#" },
        { name: "Exam Schedule", link: "#" },
        { name: "Academic Calendar", link: "#" },
        { name: "Online Clearance", link: "#" },
      ],
      icon: <Calendar size={18} />,
    },
    {
      title: "Support & Info",
      items: [
        { name: "Alumni Info", link: "#" },
        { name: "Test Results (Standard & OBE)", link: "#" },
        { name: "Student Support", link: "#" },
        { name: "Notifications", link: "#" },
        { name: "Last 30 Days Emails", link: "#" },
      ],
      icon: <FileText size={18} />,
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative bg-transparent">
      <div className="text-gray-300 p-4 sm:p-6 space-y-6 max-w-full">
        {/* User Identity Bar */}
        <div className="bg-[#2d2d39] rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center border border-[#25252b] shadow-md">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {student.fullName}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              ID: {student.studentId}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <span
              className={`px-3 py-1 rounded-full font-medium text-xs sm:text-sm text-center ${
                student.isActive
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {student.isActive ? "ACTIVE" : "INACTIVE"}
            </span>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Student Portal Section */}
        <div className="bg-[#2d2d39] rounded-lg p-4 sm:p-6 border border-[#25252b] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e1e26] flex items-center justify-center">
              <User size={26} />
            </div>

            <div className="text-center sm:text-left">
              <p className="text-white font-semibold">{student.fullName}</p>
              <p className="text-gray-400 text-sm">{student.email}</p>
              <p className="text-gray-400 text-sm">
                Department: {student.department?.name || "—"}
              </p>
            </div>
          </div>

          {/* Program Table */}
          <div className="-mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain">
            <table className="min-w-[600px] w-full text-sm text-left text-gray-300 border border-[#25252b] rounded-lg">
              <thead className="bg-[#1e1e26] text-gray-400">
                <tr>
                  <th className="px-3 sm:px-4 py-2">Select</th>
                  <th className="px-3 sm:px-4 py-2">P-Code</th>
                  <th className="px-3 sm:px-4 py-2">Program</th>
                  <th className="px-3 sm:px-4 py-2">Grade</th>
                  <th className="px-3 sm:px-4 py-2">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-[#25252b] hover:bg-[#1e1e26]/50 transition">
                  <td className="px-3 sm:px-4 py-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                  </td>

                  <td className="px-3 sm:px-4 py-2 font-semibold text-white">
                    {generateProgramCode(student?.department?.name)}
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    {student?.department?.name || "—"}
                  </td>

                  <td className="px-3 sm:px-4 py-2 font-semibold text-green-400">
                    A
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.isActive
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {student.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {navCards.map((section, idx) => (
            <div
              key={idx}
              className="bg-[#2d2d39] rounded-lg p-4 border border-[#25252b] shadow-md space-y-2 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 text-white font-semibold">
                {section.icon}
                <span>{section.title}</span>
              </div>

              <ul className="text-gray-400 text-sm mt-2 space-y-1">
                {section.items.map((item, i) => (
                  <li key={i}>
                    {item.link && item.link !== "#" ? (
                      <a
                        href={item.link}
                        className="block hover:text-white hover:bg-[#1e1e26] px-2 py-1 rounded transition"
                      >
                        • {item.name}
                      </a>
                    ) : (
                      <span className="block hover:text-white cursor-pointer px-2 py-1">
                        • {item.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
