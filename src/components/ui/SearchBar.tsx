"use client";
import { useRouter } from "next/navigation";
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
    <div className="flex w-full max-w-md">
      <Input
        placeholder="Search..."
        value={value}
        onChange={handleInputChange}
        className="flex-1"
      />
    </div>
  );
}
