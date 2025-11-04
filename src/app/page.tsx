import { Suspense } from "react";
import ListingsSearchLayout from "@/components/ListingsSearchLayout";
import { getListings } from "@/actions/get-listings";
import HomeLoading from "./loading";

async function ListingsContent() {
  const LIMIT = 10;
  const { listings, hasMore, error } = await getListings(LIMIT, 0);
  
  if (error) {
    return <div>Error loading listings</div>;
  }
  
  return (
    <ListingsSearchLayout 
      listings={listings || []} 
      initialSearch="" 
      initialHasMore={!!hasMore} 
      initialLimit={LIMIT} 
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <ListingsContent />
    </Suspense>
  );
}