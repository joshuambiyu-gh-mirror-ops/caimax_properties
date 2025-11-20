import { Suspense } from 'react';
// PropertyGallery removed per request
import { db } from '@/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MapSection from '@/components/maps/MapSection';
import { getNearestPerType } from '@/lib/calculate-nearby-amenities';
import { getRelatedListings } from '@/actions/get-listings';
import RelatedListingsClient from '@/components/RelatedListingsClient';
import ShowPageSkeleton from './loading';

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
  MapPin,
  List
} from 'lucide-react';

import IntentionForm from '@/components/intention-form';

import PropertyGallery from '@/components/PropertyGallery';
import styles from './show-page.module.css';
// Next can pass `params` as a promise-like in some runtimes — allow both sync and promise forms
interface PageProps {
  // Next's generated types may expect `params` to be a promise-like value or undefined.
  // Use the promise form to satisfy the generated constraint while keeping runtime
  // code that `await`s params working correctly.
  params?: Promise<{ slug: string }> | undefined;
}

async function ListingContent({ slug }: { slug: string }) {
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
      <div className={`${styles.contentPadding} max-w-7xl mx-auto py-8 overflow-x-hidden box-border`}>
        {/* Header Section with Breadcrumbs */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm ring-1 ring-black/5 max-w-full">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <span>Property Details</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-shrink-0">{listing.name}</h1>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
              <span className="text-base sm:text-lg truncate">{listing.location}</span>
            </div>

            {typeof listing.price === 'number' && (
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {formatPrice(listing.price)}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="md:col-span-2">
            <div className="flex flex-col gap-4">
              <PropertyGallery images={listing.images.map(img => img.url)} />

              <Card className="w-full overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className={styles.cardContent}>
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
                </div>
              </Card>

              <div className="overflow-hidden">
                <MapSection
                  listingId={listing.id}
                  lat={listing.latitude}
                  lng={listing.longitude}
                  nearestPerType={nearestPerType}
                />
              </div>
            </div>
          </section>

          <aside className="md:col-span-1 space-y-6 md:max-w-none">
            <div className="w-full md:sticky md:top-24 space-y-4">
              {typeof listing.price === 'number' && (
                <Card className="mb-4 sm:mb-6 w-full">
                  <div className={styles.cardContent + ' space-y-4 sm:space-y-6'}>
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

              <Card className="w-full overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300">
                <div className={styles.cardContent}>
                  <h3 className="text-lg font-semibold mb-3">Express Interest</h3>
                  <IntentionForm listingId={listing.id} listingName={listing.name} listingImageUrl={listing.images?.[0]?.url ?? null} />
                </div>
              </Card>
            </div>

            <Card className="w-full overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className={styles.cardContent}>
                <h3 className="text-xl font-semibold mb-4">Property Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold mb-4">Property Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Listed Date</span>
                      <span className="font-medium">{new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-medium text-sm bg-gray-100 px-3 py-1 rounded-full">{listing.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {Array.isArray(listing.facilities) && listing.facilities.length > 0 && (
              <Card className="w-full mt-4 sm:mt-6 overflow-hidden shadow-xl bg-white/95 ring-1 ring-black/5 transition-all duration-300">
                <div className={styles.cardContent}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Facilities</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {listing.facilities.map((fac: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">{fac.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </aside>
        </div>

        {/* Related Listings */}
        <div className="mt-12 pb-16">
          <Card className="mb-6 w-full bg-white/95 ring-1 ring-black/5 shadow-lg">
            <div className={styles.cardContent + ' flex items-center justify-between'}>
              <h2 className="text-2xl font-bold text-gray-900">Similar Properties You May Like</h2>
              <Button variant="outline" className="gap-2">
                <List className="h-4 w-4" />
                View All
              </Button>
            </div>
          </Card>
          <RelatedListings listingId={listing.id} />
        </div>
      </div>
    </div>
  );
}

// Page Component
export default async function Page({ params }: PageProps) {
  const resolvedParams = (await params) as { slug?: string } | undefined;
  if (!resolvedParams?.slug) return notFound();

  return (
    <Suspense fallback={<ShowPageSkeleton />}>
      <ListingContent slug={resolvedParams.slug} />
    </Suspense>
  );
}

// Related Listings Component
async function RelatedListings({ listingId }: { listingId: string }) {
  const LIMIT = 3;
  const { listings, hasMore, error } = await getRelatedListings(listingId, LIMIT, 0);

  if (error) {
    return (
      <Card className="p-8 text-center text-gray-500">
        No similar properties found at the moment.
      </Card>
    );
  }

  return (
    <Card className="p-0 bg-transparent shadow-none">
      <RelatedListingsClient initialListings={listings || []} listingId={listingId} initialHasMore={!!hasMore} initialLimit={LIMIT} />
    </Card>
  );
}
