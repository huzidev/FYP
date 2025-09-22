"use client";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <>
      <header className="w-full bg-[#25252b] px-6 py-4">
        <div className="flex items-center">
          <motion.h1 className="text-2xl font-extrabold text-red-600 relative overflow-hidden">
            <span className="relative inline-block">
              smiKonnect
              <motion.span
                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </span>
          </motion.h1>
        </div>
      </header>

      <div className="w-full h-[2px] bg-black"></div>
    </>
  );
}
