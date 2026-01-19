"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/Component/header/Header";
import NavDrawer from "@/Component/header/NavDrawer";
import ProfileMenu from "@/Component/header/menus/ProfileMenu";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const router = useRouter();

  
  useEffect(() => {
    const loadUser = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } = await import(
        "@/lib/auth"
      );

      if (!isAuthenticated()) {
        router.push("/student/signin");
        return;
      }

      const user = getCurrentUser();
      if (user.userType !== USER_TYPES.STUDENT) {
        router.push("/");
        return;
      }

      setStudent(user);
    };

    loadUser();
  }, [router]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1d1d24] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <NavDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        {/* Global Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onProfileClick={() => setActiveView("profile")}
        />

        {/* Content */}
        <main className="flex-1 px-6 py-4 bg-[#1d1d24]">
          {activeView === "profile" ? (
            <ProfileMenu
              student={student}
              onBack={() => setActiveView("dashboard")}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
