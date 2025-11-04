"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Carousel from "@/components/carousel";
import ListingsMap from "@/components/map";
import { Ribbon } from "@/components/ui/ribbon";
import MapFilters, { Filters as MapFiltersType } from "@/components/ui/MapFilters";
import { ListingWithImages } from "@/actions/get-listings";

interface ListingsSearchLayoutProps {
  listings: ListingWithImages[];
  initialSearch?: string;
  initialHasMore?: boolean;
  initialLimit?: number;
}

export default function ListingsSearchLayout({ listings, initialSearch = "", initialHasMore = false, initialLimit = 10 }: ListingsSearchLayoutProps) {
  const pathname = usePathname();
  // Extract /search/[query] from the pathname
  let search = initialSearch;
  const match = pathname.match(/^\/search\/(.+)$/);
  if (match) {
    search = decodeURIComponent(match[1]);
  }
  const [inputValue, setInputValue] = useState(search);
  useEffect(() => {
    setInputValue(search);
  }, [search]);
  // Client-side state for incremental loading
  const [items, setItems] = useState<ListingWithImages[]>(listings);
  const [limit] = useState<number>(initialLimit);
  const [skip, setSkip] = useState<number>(items.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  // Map / right-column filters
  const [mapFilters, setMapFilters] = useState<MapFiltersType>({ propertyType: undefined, minPrice: null, maxPrice: null, bedrooms: null, facilities: [] });

  // Ribbon towns & selection for quick filters above the listings
  const [selectedTown, setSelectedTown] = useState<string>(inputValue || '');
  const towns = [
    'Nairobi',
    'Karen',
    'Westlands',
    'Kilimani',
    'Syokimau',
    'Ruiru',
  ];

  // Use the controlled inputValue for client-side filtering
  // (so UI controls like the Ribbon can update the visible listings)
  const query = inputValue?.trim();
  // Start with query-based filtering
  let filteredListings = query
    ? items.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.location.toLowerCase().includes(query.toLowerCase())
      )
    : [...items];

  // Apply right-column (map) filters
  if (mapFilters.propertyType) {
    filteredListings = filteredListings.filter(l => (l as any).propertyType === mapFilters.propertyType);
  }
  if (mapFilters.minPrice != null) {
    filteredListings = filteredListings.filter(l => (l as any).price != null && (l as any).price >= (mapFilters.minPrice ?? 0));
  }
  if (mapFilters.maxPrice != null) {
    filteredListings = filteredListings.filter(l => (l as any).price != null && (l as any).price <= (mapFilters.maxPrice ?? Infinity));
  }
  if (mapFilters.bedrooms != null) {
    filteredListings = filteredListings.filter(l => typeof l.bedroomCount === 'number' && l.bedroomCount >= (mapFilters.bedrooms ?? 0));
  }
  if (mapFilters.facilities && mapFilters.facilities.length > 0) {
    filteredListings = filteredListings.filter(l => {
      const facs: string[] = (l as any).facilities || [];
      return mapFilters.facilities.every(f => facs.includes(f));
    });
  }

  

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings?limit=${limit}&skip=${skip}`);
      const json = await res.json();
      if (json.error) {
        console.error('Error fetching more listings', json.error);
        setLoading(false);
        return;
      }
      const newListings: ListingWithImages[] = json.listings || [];
      setItems(prev => [...prev, ...newListings]);
      setSkip(prev => prev + newListings.length);
      setHasMore(!!json.hasMore);
    } catch (err) {
      console.error('Failed to load more listings', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-200 min-h-screen w-full max-w-none m-0 p-0 overflow-x-hidden">
      <div className="col-span-1 lg:col-span-3 w-full">
        {/* Ribbon (town quick filters) placed at the top of the listings column */}
        <div className="mb-4 px-2">
          <Ribbon
            items={towns.map((label) => ({
              label,
              onClick: () => {
                setInputValue(label);
                setSelectedTown(label);
              },
            }))}
            selected={selectedTown}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 w-full justify-items-start">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="mb-8 w-full max-w-[384px] mx-auto">
              <h1 className="text-xl m-2 text-black-500">{listing.name}</h1>
              <Carousel listing={listing} autoSlide={true} autoSlideInterval={5000} />
            </div>
          ))}
          {filteredListings.length > 0 && hasMore && (
            <div className="sm:col-span-2 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="mt-4 mb-12 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Show more listings'}
              </button>
            </div>
          )}
          {filteredListings.length === 0 && (
            <div className="sm:col-span-2 text-center text-gray-500 py-12">No results found.</div>
          )}
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-2 shadow-none p-4 h-full w-full">
        <div className="sticky top-20 space-y-4 h-[calc(100vh-5rem)] rounded-lg overflow-hidden border border-gray-100 shadow-sm p-4">
          <MapFilters filters={mapFilters} onChange={setMapFilters} />
          <div className="w-full rounded-lg overflow-hidden">
            <ListingsMap listings={filteredListings} search={inputValue} setSearch={setInputValue} />
          </div>
        </div>
      </div>
    </div>
  );
}
