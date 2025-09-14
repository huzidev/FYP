"use client";

import { useState } from "react";
import Sidebar from "@/Component/Admin/Sidebar";
import StudentsTable from "@/Component/Admin/Student/StudentsTable";
import TeachersTable from "@/Component/Admin/Teacher/TeachersTable";
import EmployeesTable from "@/Component/Admin/Employee/EmployeesTable";

export default function AdminPage() {
  const [activePage, setActivePage] = useState("students");

  const renderContent = () => {
    switch (activePage) {
      case "students":
        return <StudentsTable />;
      case "teacher":
        return <TeachersTable />;
      case "employee":
        return <EmployeesTable />;
      default:
        return <h2 className="text-2xl font-semibold">Select a page</h2>;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar setActivePage={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-10">{renderContent()}</div>
    </div>
  );
}
