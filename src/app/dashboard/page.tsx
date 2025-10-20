
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Auth is disabled - no session check needed
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <DashboardClient />
    </div>
  );
}
