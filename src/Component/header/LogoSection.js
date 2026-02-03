import Image from "next/image";
import Link from "next/link";

export default function LogoSection() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/icon/logo.svg"
        alt="University Logo"
        width={76}
        height={60}
        className="hidden sm:block"
      />
    </div>
  );
}
