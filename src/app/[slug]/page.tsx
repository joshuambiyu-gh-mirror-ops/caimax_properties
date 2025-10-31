import PropertyGallery from '@/components/PropertyGallery';
import { db } from '@/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MapSection from '@/components/maps/MapSection';
import { getNearestPerType } from '@/lib/calculate-nearby-amenities';
import { getRelatedListings } from '@/actions/get-listings';
import Carousel from '@/components/carousel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { Listing } from '@/types/listing';
import { ProcessedAmenity } from '@/lib/calculate-nearby-amenities';
import { 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Check,
  MapPin, 
  List
} from 'lucide-react';

import IntentionForm from '@/components/intention-form';

// Next can pass `params` as a promise-like in some runtimes — allow both sync and promise forms
interface PageProps {
  // Next's generated types may expect `params` to be a promise-like value or undefined.
  // Use the promise form to satisfy the generated constraint while keeping runtime
  // code that `await`s params working correctly.
  params?: Promise<{ slug: string }> | undefined;
}

export default async function Page({ params }: PageProps) {
  // Next.js may provide `params` as a promise-like value in some runtimes.
  // Await it before using its properties to avoid the runtime error:
  // "params should be awaited before using its properties"
  const resolvedParams = (await params) as { slug?: string } | undefined;
  if (!resolvedParams?.slug) return notFound();

  const slug = resolvedParams.slug;
    const listing = await db.listing.findUnique({
    where: { id: slug },
    include: { 
      images: { orderBy: { order: 'asc' } },
      amenities: true
    },
  }) as Listing | null;
  if (!listing) return notFound();

  // Build a nearest-per-type list from stored amenities for display under the map
  const nearestPerType = getNearestPerType(listing.amenities as unknown as ProcessedAmenity[]);

  return (
    <div className="min-h-screen bg-gray-100/80">
  <div className="max-w-7xl mx-4 sm:mx-auto py-8 px-0 sm:px-6 lg:px-8">
      {/* Header Section with Breadcrumbs */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm ring-1 ring-black/5 max-w-full">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span>Property Details</span>
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.name}</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
              <span className="text-base sm:text-lg text-gray-600">{listing.location}</span>
            </div>
            {typeof listing.price === 'number' && (
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{formatPrice(listing.price)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Share and Contact buttons removed per request */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Image Carousel - Full width override */}
          <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl bg-white ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            {/* Larger gallery that breaks out of the normal container on mobile */}
            <div className="w-screen sm:w-full min-h-[280px] sm:min-h-[420px] md:min-h-[480px]">
              <PropertyGallery images={listing.images.map(img => img.url)} />
            </div>
          </div>          {/* Property Features */}
          <Card className="w-[calc(100vw-2rem)] sm:w-full overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Property Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-start sm:items-center gap-3 p-2 sm:p-0">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl shrink-0">
                    <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Bedrooms</p>
                    <p className="text-sm sm:text-base font-semibold">{listing.bedroomCount}</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3 p-2 sm:p-0">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl shrink-0">
                    <Bath className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Bathrooms</p>
                    <p className="text-sm sm:text-base font-semibold">{listing.bathroomCount}</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3 p-2 sm:p-0">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl shrink-0">
                    <Square className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Area</p>
                    <p className="text-sm sm:text-base font-semibold">{listing.footage} m²</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3 p-2 sm:p-0">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Built</p>
                    <p className="text-sm sm:text-base font-semibold">{listing.yearBuilt || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              {listing.features && listing.features.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Additional Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Location Map */}
          <div className="overflow-hidden">
            <MapSection 
                listingId={listing.id}
                lat={listing.latitude}
                lng={listing.longitude}
                nearestPerType={nearestPerType}
              />
          </div>
        </div>

        {/* Right Column - Contact and Details */}
        <div className="space-y-6 lg:max-w-none">
      <div className="w-full lg:sticky lg:top-24">
        {/* Price card (right column) */}
        {typeof listing.price === 'number' && (
          <Card className="mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="text-sm sm:text-base text-gray-500 font-medium">Price</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{formatPrice(listing.price)}</div>
              </div>
              
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <div className="text-sm sm:text-base text-gray-500 font-medium mb-2 sm:mb-3">Estimated changes</div>
                <div className="text-xs sm:text-sm text-gray-900">No changes</div>
              </div>
            </div>
          </Card>
        )}

        <div className="w-[calc(100vw-2rem)] sm:w-full">
          <IntentionForm listingId={listing.id} listingName={listing.name} listingImageUrl={listing.images?.[0]?.url ?? null} />
        </div>

            {/* Description + Details (merged) */}
            <Card className="w-[calc(100vw-2rem)] sm:w-full overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Property Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold mb-4">Property Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Listed Date</span>
                      <span className="font-medium">
                        {new Date(listing.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-medium text-sm bg-gray-100 px-3 py-1 rounded-full">
                        {listing.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Facilities Card */}
            {Array.isArray(listing.facilities) && listing.facilities.length > 0 && (
              <Card className="w-[calc(100vw-2rem)] sm:w-full mt-4 sm:mt-6 overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Facilities</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {listing.facilities.map((fac: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                        {fac.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Related Listings */}
  <div className="mt-12 pb-16">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg ring-1 ring-black/5">
          <h2 className="text-2xl font-bold text-gray-900">Similar Properties You May Like</h2>
          <Button variant="outline" className="gap-2">
            <List className="h-4 w-4" />
            View All
          </Button>
        </div>
        <RelatedListings listingId={listing.id} />
      </div>
    </div>
    </div>
  );
}

// Related Listings Component
async function RelatedListings({ listingId }: { listingId: string }) {
  const { listings, error } = await getRelatedListings(listingId);
  
  if (error || !listings?.length) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No similar properties found at the moment.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.slice(0, 3).map((listing) => (
        <Carousel key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
