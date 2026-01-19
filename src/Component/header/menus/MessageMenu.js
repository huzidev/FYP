"use client";

import { useEffect, useRef } from "react";
import { Search, Settings } from "lucide-react";

export default function MessageMenu({ onClose }) {
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
      className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <div className="flex items-center flex-1 bg-gray-100 rounded-md px-2">
          <Search size={16} className="text-gray-500" />
          <input
            placeholder="Search messages"
            className="bg-transparent px-2 py-1 w-full outline-none text-sm"
          />
        </div>
        <Settings size={18} className="cursor-pointer text-gray-600" />
      </div>

      {/* Contacts */}
      <div className="px-4 py-4 text-sm text-gray-500 border-b">
        Contacts will appear here
      </div>

      {/* Footer Tabs */}
      <div className="flex justify-around py-2 text-sm font-medium text-gray-600">
        <span className="cursor-pointer">Starred</span>
        <span className="cursor-pointer">Group</span>
        <span className="cursor-pointer">Private</span>
      </div>
    </div>
  );
}
