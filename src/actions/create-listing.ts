'use server'

import { db } from "@/db";
import { auth } from "@/auth";

interface CreateListingData {
  listingName: string;
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
}

export async function createListing(data: CreateListingData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const listing = await db.listing.create({
      data: {
        name: data.listingName,
        footage: data.footage,
        bathroomCount: data.bathroomCount,
        bedroomCount: data.bedroomCount,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        userId: session.user.id,
        images: {
          create: data.images.map((url, index) => ({
            url,
            order: index // Maintain order with thumbnail at index 0
          }))
        }
      }
    });

    return { success: true, listing };
  } catch (error) {
    console.error('Error creating listing:', error);
    return { error: 'Failed to create listing' };
  }
}