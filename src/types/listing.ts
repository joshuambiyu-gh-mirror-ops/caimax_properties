export type AmenityType = "hospital" | "school" | "supermarket" | "restaurant" | "police" | "gym" | "bus_station" | "park";

export interface ListingImage {
  url: string;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  distance: number;
  latitude: number;
  longitude: number;
  listingId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  price: number | null;
  bedroomCount: number;
  bathroomCount: number;
  footage: number;
  yearBuilt?: number;
  features?: string[];
  facilities?: string[];
  createdAt: Date;
  images: ListingImage[];
  amenities: Amenity[];
}
