import Image from "next/image";

export default function LogoSection() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/university-logo.png"
        alt="University Logo"
        width={36}
        height={36}
        className="hidden sm:block"
      />

      <span className="hidden md:block font-semibold text-lg tracking-wide">
        University CMS
      </span>
    </div>
  );
}
