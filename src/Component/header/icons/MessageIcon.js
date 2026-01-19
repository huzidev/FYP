import { Mail } from "lucide-react";

export default function MessageIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-white/10 transition"
      aria-label="Open Messages"
    >
      <Mail size={20} />
    </button>
  );
}
