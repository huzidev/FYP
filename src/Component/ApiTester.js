"use client";
import { useState } from "react";
import {
    DepartmentService
} from "../../lib/api";

export default function ApiTester() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testDepartments = async () => {
    try {
      const response = await DepartmentService.getAll();
      addResult('Get Departments', true, response.data);
    } catch (error) {
      addResult('Get Departments', false, null, error.message);
    }
  };

  const testCreateDepartment = async () => {
    try {
      const response = await DepartmentService.create({
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science'
      });
      addResult('Create Department', true, response.data);
    } catch (error) {
      addResult('Create Department', false, null, error.message);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    await testDepartments();
    await testCreateDepartment();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testDepartments(); // Test again to see the created department

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">API Integration Tester</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              result.success 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">
                {result.test}
              </h3>
              <span className="text-sm text-gray-500">
                {result.timestamp}
              </span>
            </div>
            
            <div className={`text-sm ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              Status: {result.success ? 'SUCCESS' : 'FAILED'}
            </div>

            {result.error && (
              <div className="mt-2 text-red-600 text-sm">
                <strong>Error:</strong> {result.error}
              </div>
            )}

            {result.data && (
              <div className="mt-2">
                <details>
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Response Data
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            No test results yet. Click &quot;Run Tests&quot; to start.
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500">
        <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
        <p className="text-yellow-700 text-sm">
          This tester requires a properly configured database connection. 
          Make sure your DATABASE_URL in .env.local is set correctly and 
          run <code className="bg-yellow-100 px-1 rounded">npx prisma db push</code> to 
          sync your database schema.
        </p>
      </div>
    </div>
  );
}