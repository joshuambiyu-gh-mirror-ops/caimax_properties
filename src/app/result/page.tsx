import ListingsSearchLayout from "@/components/ListingsSearchLayout";
import { getListings } from "@/actions/get-listings";

export default async function ResultPage() {
  // load first page on the server to improve first render performance
  const LIMIT = 10;
  const { listings, hasMore, error } = await getListings(LIMIT, 0);
  if (error) {
    return <div>Error loading listings</div>;
  }
  return <ListingsSearchLayout listings={listings || []} initialHasMore={!!hasMore} initialLimit={LIMIT} />;
}
