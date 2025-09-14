"use client";

export default function TeachersTable() {
  const teachers = [
    { id: 1, name: "Mr. Khan", subject: "Math", experience: "10 Years" },
    { id: 2, name: "Ms. Fatima", subject: "Science", experience: "7 Years" },
    { id: 3, name: "Mr. Ali", subject: "English", experience: "5 Years" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-black">TeachersList</h2>
      <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-black">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Subject</th>
            <th className="border px-4 py-2">Experience</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} className="text-center hover:bg-gray-100">
              <td className="border px-4 py-2">{t.id}</td>
              <td className="border px-4 py-2">{t.name}</td>
              <td className="border px-4 py-2">{t.subject}</td>
              <td className="border px-4 py-2">{t.experience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
