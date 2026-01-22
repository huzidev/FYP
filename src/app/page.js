"use client";
import Navbar from "@/Component/Nav";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Page = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const stripHtml = (value = "") => value.replace(/<[^>]*>?/gm, "");

  useEffect(() => {
    // Check if user is authenticated and redirect to appropriate dashboard
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const { isAuthenticated, getCurrentUser, getDashboardRoute } = await import("../lib/auth");
        if (isAuthenticated()) {
          const user = getCurrentUser();
          if (user && user.userType) {
            window.location.href = getDashboardRoute(user.userType);
          }
        }
      }
    };
    checkAuth();

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements?limit=5&type=ANNOUNCEMENT");
        if (!res.ok) return;
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setCurrent(0);
      } catch (err) {
        console.error("Failed to load announcements", err);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!sliderRef.current || announcements.length === 0) return;

    const slider = sliderRef.current;
    const interval = setInterval(() => {
      const width = slider.clientWidth || 1;
      setCurrent((prev) => {
        const next = (prev + 1) % announcements.length;
        slider.scrollTo({ left: next * width, behavior: "smooth" });
        return next;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [announcements]);

  const handleIndicatorClick = (idx) => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth || 1;
    sliderRef.current.scrollTo({ left: idx * width, behavior: "smooth" });
    setCurrent(idx);
  };

  const startDrag = (clientX) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseDown = (e) => startDrag(e.clientX);
  const handleTouchStart = (e) => startDrag(e.touches[0].clientX);

  const handlePointerMove = (clientX) => {
    if (!isDragging || !sliderRef.current) return;
    const delta = clientX - dragStartX;
    sliderRef.current.scrollLeft = dragScrollLeft - delta;
  };

  const handleMouseMove = (e) => {
    if (isDragging) handlePointerMove(e.clientX);
  };
  const handleTouchMove = (e) => {
    if (isDragging) handlePointerMove(e.touches[0].clientX);
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth || 1;
    const nextIndex = Math.round(sliderRef.current.scrollLeft / width);
    setCurrent(Math.min(nextIndex, Math.max(0, announcements.length - 1)));
  };

  return (
    <div className="text-white bg-[#25252b] min-h-screen flex flex-col">
      <Navbar />

      {/* --------Portal------ */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 text-white bg-[#25252b]">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Institute CMS Portal
        </h1>
        <p className="text-gray-100 max-w-2xl mb-8">
          A centralized platform to manage admissions, students, teachers, fees,
          attendance, and more. Designed to simplify academic administration.
        </p>

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold mb-2">Login to</h2>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              href="/admin/signin"
              className="px-8 py-4 bg-black hover:bg-gray-800 rounded-lg text-lg font-semibold transition text-center"
            >
              Admin
            </Link>
            <Link
              href="/staff/signin"
              className="px-8 py-4 bg-black hover:bg-gray-800 rounded-lg text-lg font-semibold transition text-center"
            >
              Staff
            </Link>
            <Link
              href="/student/signin"
              className="px-8 py-4 bg-black hover:bg-gray-800 rounded-lg text-lg font-semibold transition text-center"
            >
              Student
            </Link>
          </div>
        </div>
      </section>

      {/* --------About------ */}
      <section className="bg-[#2f2f37] py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">About Our Portal</h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          This portal provides a seamless experience for managing academic
          operations. Students can enroll and pay fees, teachers can manage
          classes and attendance, and admins have full control over the
          institution’s records. Everything is digital, secure, and efficient.
        </p>
      </section>

      {/* ---------Features-------*/}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Student Enrollment",
            desc: "Easy enrollment process for new and existing students.",
          },
          {
            title: "Fee Management",
            desc: "Track fees, installments, and generate receipts online.",
          },
          {
            title: "Attendance Tracking",
            desc: "Teachers can mark and monitor student attendance effortlessly.",
          },
          {
            title: "Class Management",
            desc: "Organize schedules, subjects, and performance records.",
          },
          {
            title: "Secure Access",
            desc: "Role-based authentication ensures safe data handling.",
          },
          {
            title: "Reports & Analytics",
            desc: "Generate reports for fees, attendance, and academics.",
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-[#2f2f37] p-8 rounded-xl shadow hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#1f1f24] py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Latest Announcements
        </h2>

        <div className="max-w-4xl mx-auto relative overflow-hidden">
          {/* -----Slider----- */}
          <div
            ref={sliderRef}
            className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth select-none transition-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ scrollbarWidth: "none", WebkitUserSelect: "none", userSelect: "none" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrag}
            onScroll={handleScroll}
          >
            {announcements.length === 0 && (
              <div className="min-w-full bg-[#2f2f37] p-6 rounded-lg shadow text-center text-gray-400">
                No announcements available yet.
              </div>
            )}

            {announcements.map((note, idx) => {
              const plainContent = stripHtml(note.content || "");
              const dateLabel = note.createdAt
                ? new Date(note.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";

              return (
                <div
                  key={idx}
                  className="min-w-full snap-center flex-shrink-0 bg-gradient-to-br from-[#2f2f37] to-[#1f1f24] p-8 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-colors duration-300"
                  style={{ pointerEvents: isDragging ? "none" : "auto" }}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-3 text-blue-400 line-clamp-2">
                      {note.title}
                    </h3>
                    {dateLabel && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1">
                        📅 {dateLabel}
                      </p>
                    )}
                    <p className="text-gray-300 text-base leading-relaxed flex-grow line-clamp-4 overflow-hidden">
                      {plainContent}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-600">
                      <span className="inline-block text-xs text-gray-500 font-semibold">
                        {`Slide ${idx + 1} of ${announcements.length}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-4 space-x-2">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleIndicatorClick(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === current ? "bg-blue-500" : "bg-gray-500"
                }`}
                aria-label={`Go to announcement ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* -----Contact----- */}
      <section className="bg-[#2f2f37] py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          Have questions? Reach out to us for help regarding admissions, portal
          access, or general inquiries.
        </p>
        <div className="text-gray-300">
          <p>Email: support@smiKonnect.com</p>
          <p>Phone: +92 300 1234567</p>
          <p>Address: II Chundrigar Road, Karachi, Pakistan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 border-t border-gray-700">
        © {new Date().getFullYear()} smiKonnect. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
