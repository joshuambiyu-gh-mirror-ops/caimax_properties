"use client";

export default function DashboardClient({ user }: { user?: { name?: string; email?: string } | undefined }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="mb-4">Welcome, {user?.name || user?.email || 'Guest'}</p>
      {/* Add your dashboard content here */}
    </div>
  );
}
