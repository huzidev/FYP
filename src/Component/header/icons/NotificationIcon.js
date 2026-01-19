import { Bell } from "lucide-react";

export default function NotificationIcon({ onClick }) {
  return (
    <button onClick={onClick} className="p-2 rounded-lg hover:bg-white/10">
      <Bell size={20} />
    </button>
  );
}
