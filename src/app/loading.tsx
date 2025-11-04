import { Skeleton } from "@/components/ui/skeleton"
import { PropertyGridSkeleton } from "@/components/property-card-skeleton"

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-100/80">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero section skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 max-w-2xl" />
          <Skeleton className="h-6 w-1/2 max-w-xl" />
        </div>

        {/* Search filters skeleton */}
        <div className="flex flex-wrap gap-4 items-center">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32" />
          ))}
        </div>

        {/* Property grid skeleton */}
        <PropertyGridSkeleton />
      </div>
    </div>
  )
}