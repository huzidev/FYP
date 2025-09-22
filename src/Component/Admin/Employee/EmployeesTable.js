"use client";

export default function EmployeesTable() {
  const employees = [
    { id: 1, name: "Hassan", department: "HR", role: "Manager" },
    { id: 2, name: "Zara", department: "IT", role: "Developer" },
    { id: 3, name: "Bilal", department: "Finance", role: "Accountant" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-black">EmployeesList</h2>
      <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-black">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Department</th>
            <th className="border px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id} className="text-center hover:bg-gray-100">
              <td className="border px-4 py-2">{e.id}</td>
              <td className="border px-4 py-2">{e.name}</td>
              <td className="border px-4 py-2">{e.department}</td>
              <td className="border px-4 py-2">{e.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
