"use client";

import { ApiError, StaffService, StudentService } from "@/lib/api";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalStaff: 0,
    admissionStaff: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students
      const studentsResponse = await StudentService.getAll();
      const students = studentsResponse.data.data || [];

      // Fetch staff
      const staffResponse = await StaffService.getAll();
      const staff = staffResponse.data.data || [];

      // Calculate stats
      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.isActive).length;
      const inactiveStudents = totalStudents - activeStudents;

      const totalStaff = staff.length;
      const admissionStaff = staff.filter((s) => s.role === "ADMISSION").length;
      const teachers = staff.filter((s) => s.role === "TEACHER").length;

      setStats({
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalStaff,
        admissionStaff,
        teachers,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch statistics");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      bgColor: "bg-blue-600",
      icon: "👥",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      bgColor: "bg-green-600",
      icon: "✅",
    },
    {
      title: "Inactive Students",
      value: stats.inactiveStudents,
      bgColor: "bg-red-600",
      icon: "❌",
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      bgColor: "bg-purple-600",
      icon: "👨‍💼",
    },
    {
      title: "Admission Staff",
      value: stats.admissionStaff,
      bgColor: "bg-yellow-600",
      icon: "📋",
    },
    {
      title: "Teachers",
      value: stats.teachers,
      bgColor: "bg-indigo-600",
      icon: "👨‍🏫",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
