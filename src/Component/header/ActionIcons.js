import NotificationIcon from "./icons/NotificationIcon";
import MessageIcon from "./icons/MessageIcon";
import ProfileIcon from "./icons/ProfileIcon";

export default function ActionIcons() {
  return (
    <div className="flex items-center gap-3">
      <NotificationIcon />
      <MessageIcon />
      <ProfileIcon />
    </div>
  );
}
