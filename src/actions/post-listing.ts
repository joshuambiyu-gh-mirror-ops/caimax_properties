'use server';

import { db } from "@/db";
import { revalidatePath } from "next/cache";

interface ListingData {
  thumbnailId: string;
  imageIds: string[];
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  latitude: number;
  longitude: number;
  userId: string;    // Add this field
}

export async function createListing({
  thumbnailId,
  imageIds,
  footage,
  bathroomCount,
  bedroomCount,
  location,
  latitude,
  longitude,
  userId,
}: ListingData) {
  try {
    const listing = await db.listing.create({
      data: {
        thumbnailUrl: thumbnailId,
        footage,
        bathroomCount,
        bedroomCount,
        location,
        latitude,
        longitude,
        userId,        // Add this field
        images: {
          create: imageIds.map((imageId: string) => ({
            url: imageId
          }))
        }
      }
    });

    revalidatePath('/listings');
    return { success: true, listing };
  } catch (error) {
    console.error('Error saving listing:', error);
    return { error: 'Failed to save listing' };
  }
}