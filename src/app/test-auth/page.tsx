"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation"; // ✅ Correct import for App Router

export default function TestAuth() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/api/google"); // Redirect to the Google Auth API route
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Google Authentication Test</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600 transition"
      >
        Login with Google
      </button>
    </div>
  );
}
