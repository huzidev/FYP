"use client";

import ActionIcons from "./ActionIcons";
import LogoSection from "./LogoSection";
import SidebarToggle from "./SidebarToggle";

export default function Header({ onMenuClick, onProfileClick }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#25252b] shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-3">
          <SidebarToggle onClick={onMenuClick} />
          <LogoSection />
        </div>

        {/* Right */}
        <ActionIcons toggleProfile={onProfileClick} />
      </div>
    </header>
  );
}
