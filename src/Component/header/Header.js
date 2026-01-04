"use client";

import { useState } from "react";
import SidebarToggle from "./SidebarToggle";
import LogoSection from "./LogoSection";
import ActionIcons from "./ActionIcons";
import NavDrawer from "./NavDrawer";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <SidebarToggle onClick={() => setOpen(true)} />
            <LogoSection />
          </div>

          {/* Right Section */}
          <ActionIcons />
        </div>
      </header>

      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
