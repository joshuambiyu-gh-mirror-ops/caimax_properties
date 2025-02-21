import Link from "next/link";
import Image from "next/image"; // Import Image component

import { cn } from "@/lib/utils";
import HeaderAuth from "@/components/header-auth";
import { Input } from "./ui/input";

export default function Header() {
  return (
    <nav className={cn("shadow mb-6 flex bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-500  items-center justify-between p-4 gap-3")}> 
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div>
          <Image src="/caimax_logo.jpg" alt="Caimax Properties Logo" width={50} height={50} /> {/* Insert logo image */}
        </div>
        <div className="text-sm  md:text-lg  hover:shadow-red-500/50 transition-shadow duration-300">
          <Link href="/" className="font-bold text-black">
            Caimax Properties
          </Link>
        </div>
      </div>

      {/* Center Content (Search Input) */}
      <div className="flex-1 flex justify-center">
        <Input placeholder="Search..." className="max-w-md" />
      </div>

      {/* Right Content (Authentication) */}
      <div>
        <HeaderAuth />
      </div>
    </nav>
  );
}
