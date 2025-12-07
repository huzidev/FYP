"use client";

import { ApiError, DepartmentService, SubjectService } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CoursesPage() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "departments") {
        const response = await DepartmentService.getAll();
        setDepartments(response.data.data || []);
      } else {
        const response = await SubjectService.getAll();
        setSubjects(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Courses & Departments</h1>
          <p className="text-gray-400">Manage departments and courses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#25252b]">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "departments"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "subjects"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Subjects
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === "departments" ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-600 bg-[#1e1e26] shadow-md rounded-lg text-white">
              <thead className="bg-[#25252b]">
                <tr>
                  <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Code</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-[#2d2d39]">
                      <td className="border border-gray-600 px-4 py-2">{dept.id}</td>
                      <td className="border border-gray-600 px-4 py-2">{dept.name}</td>
                      <td className="border border-gray-600 px-4 py-2">{dept.code}</td>
                      <td className="border border-gray-600 px-4 py-2">{dept.description || 'N/A'}</td>
                      <td className="border border-gray-600 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            dept.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {dept.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-600 bg-[#1e1e26] shadow-md rounded-lg text-white">
              <thead className="bg-[#25252b]">
                <tr>
                  <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Code</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Credit Hours</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Department</th>
                  <th className="border border-gray-600 px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No subjects found
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-[#2d2d39]">
                      <td className="border border-gray-600 px-4 py-2">{subject.id}</td>
                      <td className="border border-gray-600 px-4 py-2">{subject.name}</td>
                      <td className="border border-gray-600 px-4 py-2">{subject.code}</td>
                      <td className="border border-gray-600 px-4 py-2">{subject.creditHours}</td>
                      <td className="border border-gray-600 px-4 py-2">{subject.department?.name || 'N/A'}</td>
                      <td className="border border-gray-600 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            subject.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subject.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
