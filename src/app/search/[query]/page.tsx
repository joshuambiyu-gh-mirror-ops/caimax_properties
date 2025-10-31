import ListingsSearchLayout from "@/components/ListingsSearchLayout";
import { getListings } from "@/actions/get-listings";

interface SearchPageProps {
  // Match Next's generated type which may be `Promise<any> | undefined`.
  // Use a promise-like params type so PageProps constraints are satisfied.
  params?: Promise<{ query: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { listings, error } = await getListings();
  if (error) {
    return <div>Error loading listings</div>;
  }

  // Await params (Next may provide a promise-like value). If undefined, default to empty query.
  const resolved = (await params) as { query?: string } | undefined;
  const initialSearch = decodeURIComponent(resolved?.query ?? "");
  return <ListingsSearchLayout listings={listings || []} initialSearch={initialSearch} />;
}
