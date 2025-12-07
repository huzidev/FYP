"use client";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-[400px] max-w-[90%]",
    md: "w-[600px] max-w-[90%]",
    lg: "w-[800px] max-w-[90%]",
    xl: "w-[1000px] max-w-[95%]",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      {/* Modal box */}
      <div
        className={`bg-[#2d2d39] border-8 border-[#25252b] rounded-xl shadow-2xl ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#25252b] flex justify-between items-center bg-[#1d1d24] rounded-t-xl">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-semibold transition"
          >
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#2d2d39]">
          {children}
        </div>
      </div>
    </div>
  );
}
