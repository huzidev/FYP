import Image from "next/image";
import Link from "next/link";

export default function LogoSection() {
  return (
    <div className="flex items-center gap-2">
      {/* <Image
        src="/university-logo.png"
        alt="University Logo"
        width={36}
        height={36}
        className="hidden sm:block"
      /> */}

      <Link href="/">
        <h1 className="text-white cursor-pointer font-extrabold text-2xl">
          SmiConnect
        </h1>
      </Link>
    </div>
  );
}
