import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

function ShowPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100/80">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-8">
          <div className="flex items-center text-sm gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm ring-1 ring-black/5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="flex flex-col gap-4 sm:gap-6 mt-4">
            <Skeleton className="h-8 w-3/4 max-w-2xl" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-3">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery Skeleton */}
            <Card className="overflow-hidden shadow-lg">
              <div className="aspect-[4/3] w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </Card>

            {/* Features Skeleton */}
            <Card className="w-full overflow-hidden">
              <div className="p-6">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Map Skeleton */}
            <Card className="overflow-hidden">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:max-w-none">
            <div className="w-full md:sticky md:top-24">
              {/* Price Card Skeleton */}
              <Card className="mb-6">
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-3">
                    <Skeleton className="h-4 w-20 mx-auto" />
                    <Skeleton className="h-8 w-32 mx-auto" />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>

              {/* Contact Form Skeleton */}
              <Card className="w-full overflow-hidden">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-48 mb-4" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-full mt-6" />
                </div>
              </Card>

              {/* Description Skeleton */}
              <Card className="w-full overflow-hidden mt-6">
                <div className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Listings Skeleton */}
        <div className="mt-12 pb-16">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowPageSkeleton