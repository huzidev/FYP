"use client";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    primary: "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#2d2d39] border-8 border-[#25252b] rounded-xl shadow-2xl w-[450px] max-w-[90%]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#25252b] bg-[#1d1d24] rounded-t-xl">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#2d2d39]">
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-[#1e1e26] text-gray-300 rounded-lg hover:bg-[#25252b] transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 cursor-pointer text-white rounded-lg transition ${variantClasses[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
