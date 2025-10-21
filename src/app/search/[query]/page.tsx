import ListingsSearchLayout from "@/components/ListingsSearchLayout";
import { getListings } from "@/actions/get-listings";

interface SearchPageProps {
  params: { query: string };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { listings, error } = await getListings();
  if (error) {
    return <div>Error loading listings</div>;
  }
  const initialSearch = decodeURIComponent(params.query || "");
  return <ListingsSearchLayout listings={listings || []} initialSearch={initialSearch} />;
}
