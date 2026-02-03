"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ClassSchedule() {
  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Hardcoded schedule for all courses
  const fixedSchedule = {
    MATH101: { day: "Monday", time: "09:00 AM - 10:30 AM", room: "A101" },
    PHY101: { day: "Monday", time: "11:00 AM - 12:30 PM", room: "B202" },
    CHEM101: { day: "Tuesday", time: "09:00 AM - 10:30 AM", room: "C303" },
    ENG101: { day: "Wednesday", time: "02:00 PM - 03:30 PM", room: "D404" },
    CS101: { day: "Thursday", time: "10:00 AM - 11:30 AM", room: "E505" },
    HIST101: { day: "Friday", time: "01:00 PM - 02:30 PM", room: "F606" },
    DEFAULT: { day: "Friday", time: "03:00 PM - 04:30 PM", room: "T101" }, // fallback
  };

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
        Your Class Schedule
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
                <th className="py-3 px-6 text-left">Day</th>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Room</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map((enrollment, idx) => {
                const code = enrollment.subject.code;
                const schedule = fixedSchedule[code] || fixedSchedule.DEFAULT;

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
                      {schedule.day}
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
