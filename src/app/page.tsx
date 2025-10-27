import ListingsSearchLayout from "@/components/ListingsSearchLayout";
import { getListings } from "@/actions/get-listings";

export default async function Home() {
  const { listings, error } = await getListings();
  if (error) {
    return <div>Error loading listings</div>;
  }
  return <ListingsSearchLayout listings={listings || []} initialSearch={""} />;

  
}