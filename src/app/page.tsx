import Carousel from "@/components/carousel";
import ListingsMap from "@/components/map";
import { getListings } from "@/actions/get-listings";

export default async function Home() {
  const { listings, error } = await getListings();
  
  if (error) {
    return <div>Error loading listings</div>;
  }

  return (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-200 min-h-screen w-full max-w-none m-0 p-0">
  <div className="col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-3 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {listings?.map((listing, index) => (
            <div key={listing.id} className="mb-8">
              {/* property tile content unchanged */}
              <h1 className="text-xl m-2 text-black-500">{listing.name}</h1>
              <Carousel 
                listing={listing}
                autoSlide={true} 
                autoSlideInterval={5000} 
              />
            </div>
          ))}
        </div>
      </div>
  <div className="hidden md:block md:col-span-2 lg:col-span-2 xl:col-span-2 border-l shadow-none p-0 h-full w-full">
        <ListingsMap listings={listings || []} />
      </div>
    </div>
  );
}