"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "./input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const router = useRouter();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    // Instantly update the URL to /search/[query] (or home if empty) without navigation flicker
    if (newValue.trim()) {
      router.replace(`/search/${encodeURIComponent(newValue.trim())}`);
    } else {
      router.replace(`/`);
    }
  }

  return (
    <div className="relative flex w-full max-w-md items-center">
      <Search className="absolute left-3 h-4 w-4 text-gray-500" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Search locations or property types..."
        value={value}
        onChange={handleInputChange}
        className="flex-1 pl-9 pr-4"
      />
    </div>
  );
}
