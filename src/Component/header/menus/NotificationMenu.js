"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings, MessageCircle, Calendar } from "lucide-react";

export default function NotificationMenu({ onClose }) {
  const ref = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Fetch student announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/announcements?visibility=student&limit=5",
        );
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-[#1e1e26] rounded-lg shadow-xl border border-gray-700 z-50 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h4 className="font-semibold">Notifications</h4>
        <div className="flex gap-2">
          <Check size={18} className="cursor-pointer text-white" />
          <Settings size={18} className="cursor-pointer text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="ml-2 text-white">Loading...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-400">
            <MessageCircle size={32} className="mx-auto mb-2 text-white" />
            No announcements for students
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-gray-700 hover:bg-[#2a2a3a] cursor-pointer"
            >
              <Calendar size={18} className="mt-1 text-white" />
              <div>
                <p className="text-sm font-medium">{ann.title}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(ann.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center text-gray-400 text-xs border-t border-gray-700">
        {announcements.length} announcements
      </div>
    </div>
  );
}
