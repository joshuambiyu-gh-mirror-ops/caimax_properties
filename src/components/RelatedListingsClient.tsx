"use client";
import React, { useState } from "react";
import Carousel from "@/components/carousel";
import { ListingWithImages } from "@/actions/get-listings";

interface Props {
  initialListings: ListingWithImages[];
  listingId: string;
  initialHasMore?: boolean;
  initialLimit?: number;
}

export default function RelatedListingsClient({ initialListings, listingId, initialHasMore = false, initialLimit = 3 }: Props) {
  const [items, setItems] = useState<ListingWithImages[]>(initialListings);
  const [skip, setSkip] = useState<number>(initialListings.length);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loading, setLoading] = useState(false);
  const limit = initialLimit;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/related-listings?listingId=${encodeURIComponent(listingId)}&limit=${limit}&skip=${skip}`);
      const json = await res.json();
      if (json.error) {
        console.error('Error fetching more related listings', json.error);
        setLoading(false);
        return;
      }
      const newListings: ListingWithImages[] = json.listings || [];
      setItems(prev => [...prev, ...newListings]);
      setSkip(prev => prev + newListings.length);
      setHasMore(!!json.hasMore);
    } catch (err) {
      console.error('Failed to load more related listings', err);
    } finally {
      setLoading(false);
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No similar properties found at the moment.</div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(listing => (
          <Carousel key={listing.id} listing={listing} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="mt-4 mb-12 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Show more related properties'}
          </button>
        </div>
      )}
    </div>
  );
}
