"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "./input";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const router = useRouter();
  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = useState<string>(value ?? '');

  useEffect(() => {
    if (isControlled) return;
    // keep internal value in sync with the url pathname when uncontrolled
    const path = window.location.pathname;
    const match = path.match(/^\/search\/(.+)$/);
    setInternalValue(match ? decodeURIComponent(match[1]) : '');
  }, [isControlled]);

  useEffect(() => {
    // keep internal in sync if parent controls value
    if (isControlled) setInternalValue(value ?? '');
  }, [value, isControlled]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);
    if (isControlled) return;
    setInternalValue(newValue);

    // Instantly update the URL to /search/[query] (or home if empty) without navigation flicker
    if (newValue.trim()) {
      router.replace(`/search/${encodeURIComponent(newValue.trim())}`);
    } else {
      router.replace(`/`);
    }
  }

  return (
    <div className="relative flex w-full max-w-xl items-center group">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-white/30 to-white/20 blur transition-all duration-300 group-hover:from-white/30 group-hover:via-white/40 group-hover:to-white/30"></div>
      <div className="relative flex w-full items-center bg-white/20 backdrop-blur rounded-lg ring-1 ring-white/30 transition-all duration-300 group-hover:bg-white/30">
        <Search className="absolute left-3 h-5 w-5 text-white transition-opacity duration-300 group-hover:opacity-80" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search locations or property types..."
          value={internalValue}
          onChange={handleInputChange}
          className="flex-1 pl-10 pr-4 border-0 bg-transparent text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0 transition-shadow duration-300"
        />
      </div>
    </div>
  );
}
