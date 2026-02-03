"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ExamSchedule() {
  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Hardcoded exam schedule (case-insensitive)
  const fixedExamSchedule = {
    MATH101: {
      date: "2026-06-10",
      time: "09:00 AM - 11:00 AM",
      room: "Exam Hall A",
    },
    PHY101: {
      date: "2026-06-11",
      time: "12:00 PM - 02:00 PM",
      room: "Exam Hall B",
    },
    CHEM101: {
      date: "2026-06-12",
      time: "09:00 AM - 11:00 AM",
      room: "Exam Hall C",
    },
    ENG101: {
      date: "2026-06-13",
      time: "02:00 PM - 04:00 PM",
      room: "Exam Hall D",
    },
    CS101: {
      date: "2026-06-14",
      time: "10:00 AM - 12:00 PM",
      room: "Exam Hall E",
    },
    HIST101: {
      date: "2026-06-15",
      time: "01:00 PM - 03:00 PM",
      room: "Exam Hall F",
    },
  };

  const DEFAULT = { date: "TBA", time: "TBA", room: "TBA" };

  // Fetch current user
  useEffect(() => {
    const loadUser = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } =
        await import("@/lib/auth");

      if (!isAuthenticated()) {
        router.replace("/student/signin");
        return;
      }

      const user = getCurrentUser();
      if (!user || user.userType !== USER_TYPES.STUDENT) {
        router.replace("/student/signin");
        return;
      }

      setStudent(user);
      await fetchEnrolledCourses(user.id);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async (studentId) => {
    try {
      const res = await fetch(`/api/enrollments?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setEnrolledCourses(data.data);
      }
    } catch (err) {
      toast.error("Failed to load enrolled courses");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#2d2d39] p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">
        Your Exam Schedule
      </h1>

      {enrolledCourses.length === 0 ? (
        <p className="text-center text-gray-400">No courses enrolled yet.</p>
      ) : (
        <div className="overflow-x-auto max-w-4xl mx-auto">
          <table className="min-w-full bg-[#1e1e26] rounded-lg shadow-lg border border-gray-700">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="py-3 px-6 text-left">Course Code</th>
                <th className="py-3 px-6 text-left">Course Name</th>
                <th className="py-3 px-6 text-left">Exam Date</th>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Room</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map((enrollment, idx) => {
                // Normalize course code (remove spaces, uppercase)
                const code = enrollment.subject.code
                  .replace(/\s+/g, "")
                  .toUpperCase();
                const schedule = fixedExamSchedule[code] || DEFAULT;

                return (
                  <tr
                    key={enrollment.id}
                    className={idx % 2 === 0 ? "bg-[#2f2f41]" : "bg-[#262634]"}
                  >
                    <td className="py-3 px-6 text-white font-semibold">
                      {code}
                    </td>
                    <td className="py-3 px-6 text-white">
                      {enrollment.subject.name}
                    </td>
                    <td className="py-3 px-6 text-gray-400 font-medium">
                      {schedule.date}
                    </td>
                    <td className="py-3 px-6 text-gray-400 font-medium">
                      {schedule.time}
                    </td>
                    <td className="py-3 px-6 text-gray-400 font-medium">
                      {schedule.room}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
