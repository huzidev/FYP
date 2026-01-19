"use client";

import { useEffect, useRef } from "react";
import { Check, Settings } from "lucide-react";

export default function NotificationMenu({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h4 className="font-semibold text-gray-800">Notifications</h4>
        <div className="flex gap-2 text-gray-600">
          <Check size={18} className="cursor-pointer" />
          <Settings size={18} className="cursor-pointer" />
        </div>
      </div>

      <div className="px-4 py-6 text-center text-sm text-gray-500">
        You have no notifications
      </div>
    </div>
  );
}
