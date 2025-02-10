import Link from "next/link";

import { cn } from "@/lib/utils";
import HeaderAuth from "@/components/header-auth";
import { Input } from "./ui/input";

export default function Header() {
  return (
    <nav className={cn("shadow mb-6 bg-white flex items-center justify-between p-4")}> 
      {/* Brand */}
      <div>
        <Link href="/" className="font-bold text-black">
          Caimax Properties
        </Link>
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
