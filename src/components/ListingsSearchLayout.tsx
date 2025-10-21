"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Carousel from "@/components/carousel";
import ListingsMap from "@/components/map";
import { ListingWithImages } from "@/actions/get-listings";

interface ListingsSearchLayoutProps {
  listings: ListingWithImages[];
  initialSearch?: string;
}

export default function ListingsSearchLayout({ listings, initialSearch = "" }: ListingsSearchLayoutProps) {
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
  const filteredListings = search
    ? listings.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.location.toLowerCase().includes(search.toLowerCase())
      )
    : listings;

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
