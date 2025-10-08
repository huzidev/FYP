"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Modal box */}
      <div
        className="bg-white rounded-xl shadow-2xl pointer-events-auto
                   w-[450px] max-w-[70%] h-[350px] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex items-center justify-center px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
