import PropertyGallery from '@/components/PropertyGallery';
import { db } from '@/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ListingsMap, MapboxListingMap } from '@/components/maps';
import { getRelatedListings } from '@/actions/get-listings';
import Carousel from '@/components/carousel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  Building2, 
  Star, 
  Phone, 
  Calendar, 
  Mail, 
  Check,
  MapPin, 
  List
} from 'lucide-react';


interface PageProps {
  params: { slug: string };
}
export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
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
  });
  if (!listing) return notFound();

  return (
    <div className="min-h-screen bg-gray-100/80">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section with Breadcrumbs */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm ring-1 ring-black/5 w-fit">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span>Property Details</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <p className="text-lg text-gray-600">{listing.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button size="lg" variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Share
            </Button>
            <Button size="lg" variant="default" className="gap-2">
              <Phone className="h-4 w-4" />
              Contact Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Carousel */}
          <div className="rounded-xl overflow-hidden shadow-xl bg-white ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <PropertyGallery images={listing.images.map(img => img.url)} />
          </div>

          {/* Property Features */}
          <Card className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Property Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Bed className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="text-base font-semibold">{listing.bedroomCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Bath className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="text-base font-semibold">{listing.bathroomCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Square className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="text-base font-semibold">{listing.footage} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Built</p>
                    <p className="text-base font-semibold">{(listing as any).yearBuilt || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              {Array.isArray((listing as any).features) && (listing as any).features.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Additional Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(listing as any).features.map((feature: string, index: number) => (
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
          <Card className="overflow-hidden shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location & Nearby Places</h2>
              <div className="aspect-[16/9] rounded-lg overflow-hidden">
                <MapboxListingMap
                  listingId={listing.id}
                  lat={listing.latitude}
                  lng={listing.longitude}
                  name={listing.name}
                  address={listing.location}
                />
              </div>
              
              {/* Nearby Amenities */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(listing as any).amenities?.map((amenity: any) => (
                  <div key={amenity.id} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{amenity.type}</p>
                      <p className="text-sm text-gray-600">{amenity.name}</p>
                      <p className="text-sm text-gray-500">{amenity.distance.toFixed(2)} km away</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Contact and Details */}
        <div className="space-y-6 lg:max-w-none">
          <div className="sticky top-24 w-full">
            <Card className="overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Express Interest</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      name="name"
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input
                      name="phone"
                      placeholder="Enter your phone number"
                      type="tel"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Message</Label>
                    <Textarea
                      name="message"
                      placeholder="Tell us about your interest in this property..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button size="lg" className="w-full">Submit Interest</Button>
                </div>
              </div>
            </Card>

            {/* Property Description */}
            <Card className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Property Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </Card>
            
            {/* Additional Property Details */}
            <Card className="mt-6 overflow-hidden shadow-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Property Details</h3>
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
            </Card>
          </div>
        </div>
      </div>
      {/* Related Listings */}
      <div className="mt-16 pb-16">
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
