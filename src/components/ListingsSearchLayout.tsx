"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Carousel from "@/components/carousel";
import ListingsMap from "@/components/map";
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

  const filteredListings = search
    ? items.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.location.toLowerCase().includes(search.toLowerCase())
      )
    : items;

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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-200 min-h-screen w-full max-w-none m-0 p-0 overflow-x-hidden">
      <div className="col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-3 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="mb-8">
              <h1 className="text-xl m-2 text-black-500">{listing.name}</h1>
              <Carousel listing={listing} autoSlide={true} autoSlideInterval={5000} />
            </div>
          ))}
          {filteredListings.length > 0 && hasMore && (
            <div className="col-span-2 flex justify-center">
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
            <div className="col-span-2 text-center text-gray-500 py-12">No results found.</div>
          )}
        </div>
      </div>
      <div className="hidden md:block md:col-span-2 lg:col-span-2 xl:col-span-2 shadow-none p-0 h-full w-full mr-6">
        <ListingsMap listings={filteredListings} search={inputValue} setSearch={setInputValue} />
      </div>
    </div>
  );
}
