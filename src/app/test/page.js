"use client";
import { useEffect, useState } from "react";
import { ApiError, DepartmentService, StudentService } from "../../lib/api";

export default function TestAPIPage() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setLoading(true);
      
      // Test departments
      const deptResponse = await DepartmentService.getAll();
      setDepartments(deptResponse.data.data || []);
      
      // Test students
      const studentResponse = await StudentService.getAll();
      setStudents(studentResponse.data.data || []);
      
      setError(null);
    } catch (err) {
      console.error("API Test Error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch data from API");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Testing API Connection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🎉 API Integration Test</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Departments */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📚 Departments ({departments.length})
              </h2>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-800">{dept.name}</div>
                    <div className="text-sm text-gray-600">Code: {dept.code}</div>
                    <div className="text-xs text-gray-500">{dept.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎓 Students ({students.length})
              </h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-800">{student.fullName}</div>
                    <div className="text-sm text-gray-600">ID: {student.studentId}</div>
                    <div className="text-sm text-gray-600">Email: {student.email}</div>
                    <div className="text-xs text-gray-500">
                      Department: {student.department?.name || 'N/A'} | Level: {student.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {!error && departments.length > 0 && students.length > 0 && (
            <div className="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-semibold">✅ API Integration Successful!</h3>
              <p>Your database connection and API routes are working properly.</p>
            </div>
          )}

          {/* Test Login Section */}
          <div className="mt-8 bg-blue-50 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <h3 className="font-semibold mb-2">🔐 Test Login Credentials:</h3>
            <div className="text-sm space-y-1">
              <div><strong>Admin:</strong> admin@university.edu / admin123</div>
              <div><strong>Staff:</strong> john.teacher@university.edu / staff123</div>
              <div><strong>Student:</strong> alice.student@university.edu / student123</div>
            </div>
            <div className="mt-2 text-xs">
              Go to <strong>/admin/signin</strong>, <strong>/staff/signin</strong>, or <strong>/student/signin</strong> to test login.
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={testAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Refresh Data
            </button>
            <a
              href="/admin/signin"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔑 Test Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}