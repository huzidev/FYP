"use client";


const Sidebar = ({ setActivePage = () => {} }) => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">MyAdmin</h1>
      </div>

      
      <nav className="flex-1 p-5 space-y-4">
        <button
          onClick={() => setActivePage("students")}
          className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition"
        >
          Students
        </button>
        <button
          onClick={() => setActivePage("teacher")}
          className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition"
        >
          Teacher
        </button>
        <button
          onClick={() => setActivePage("employee")}
          className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition"
        >
          Employee
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
