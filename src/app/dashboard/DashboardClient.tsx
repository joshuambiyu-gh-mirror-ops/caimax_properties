"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const OnboardingModal = dynamic(() => import("@/components/ui/onboarding-modal"), { ssr: false });

export default function DashboardClient({ user }: { user: any }) {
  const showOnboarding = user.onboarded === false;
  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">Welcome, {user.name || user.email}</p>
        {/* Add your dashboard content here */}
      </div>
      <Suspense fallback={null}>
        {showOnboarding && (
          <OnboardingModal onComplete={(propertyTypes) => {
            // TODO: Call API to update onboarded=true and save propertyTypes
            window.location.reload();
          }} />
        )}
      </Suspense>
    </>
  );
}
