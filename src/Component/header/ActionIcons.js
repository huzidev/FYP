"use client";

import { useState } from "react";
import NotificationIcon from "./icons/NotificationIcon";
import MessageIcon from "./icons/MessageIcon";
import ProfileIcon from "./icons/ProfileIcon";

import NotificationMenu from "./menus/NotificationMenu";
import MessageMenu from "./menus/MessageMenu";

export default function ActionIcons({ toggleProfile }) {
  const [open, setOpen] = useState(null);

  const toggle = (key) => setOpen(open === key ? null : key);

  return (
    <div className="relative flex items-center gap-3">
      <NotificationIcon onClick={() => toggle("notification")} />
      <MessageIcon onClick={() => toggle("message")} />
      <ProfileIcon onClick={toggleProfile} />

      {open === "notification" && (
        <NotificationMenu onClose={() => setOpen(null)} />
      )}
      {open === "message" && <MessageMenu onClose={() => setOpen(null)} />}
    </div>
  );
}
