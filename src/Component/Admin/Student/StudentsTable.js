"use client";

export default function StudentsTable() {
  const students = [
    { id: 1, name: "Ali", grade: "A", age: 16 },
    { id: 2, name: "Sara", grade: "B", age: 17 },
    { id: 3, name: "Ahmed", grade: "A+", age: 15 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-black">StudentsList</h2>
      <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-black">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Grade</th>
            <th className="border px-4 py-2">Age</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="text-center hover:bg-gray-100">
              <td className="border px-4 py-2">{s.id}</td>
              <td className="border px-4 py-2">{s.name}</td>
              <td className="border px-4 py-2">{s.grade}</td>
              <td className="border px-4 py-2">{s.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
