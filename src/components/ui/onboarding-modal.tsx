"use client";
import { useState } from "react";

export default function OnboardingModal({ onComplete }: { onComplete: (propertyTypes: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const propertyTypes = [
    "Apartments",
    "Houses",
    "Land",
    "Commercial",
    "Luxury",
    "Affordable",
  ];

  function toggleType(type: string) {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">Welcome to Caimax Properties!</h2>
        <p className="mb-4 text-center text-gray-600">What kind of properties would you love to see?</p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {propertyTypes.map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full border transition-all duration-150 ${selected.includes(type) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"}`}
              onClick={() => toggleType(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
        <button
          className="w-full py-2 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
          disabled={selected.length === 0}
          onClick={() => onComplete(selected)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
