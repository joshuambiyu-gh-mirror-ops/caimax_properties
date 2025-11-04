import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        {/* Title and price */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        {/* Location */}
        <Skeleton className="h-4 w-5/6" />
        
        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>
    </Card>
  )
}

export function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}