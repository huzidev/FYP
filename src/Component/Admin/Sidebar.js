"use client";

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { key: "students", label: "Students" },
    { key: "teacher", label: "Teachers" },
    { key: "employee", label: "Employees" },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">MyAdmin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={`w-full text-left py-2 px-4 rounded-lg transition-all duration-200 ${
              activePage === item.key
                ? "bg-gray-700 text-blue-400"
                : "hover:bg-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
