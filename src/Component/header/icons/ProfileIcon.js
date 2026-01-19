import { User } from "lucide-react";

export default function ProfileIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-white/10 transition"
      aria-label="Open Profile"
    >
      <User size={20} />
    </button>
  );
}
