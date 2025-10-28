'use server'

import { db } from "@/db";
import { calculateAndStoreAmenities } from "@/lib/calculate-nearby-amenities";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface CreateListingData {
  listingName: string;
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  propertyType: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'CONDO' | 'DUPLEX' | 'STUDIO' | 'LAND' | 'OTHER';
  price: number | null;
  facilities: ('LAUNDRY' | 'SWIMMING_POOL' | 'WIFI' | 'PET_FRIENDLY' | 'PARKING' | 'GYM')[];
  images: string[];
  userId?: string;
}

async function waitForDatabase(maxAttempts = 3): Promise<boolean> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      // Avoid forcing an explicit connect; perform a lightweight query to confirm availability
      await db.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        console.error('Failed to connect to database after multiple attempts:', error);
        return false;
      }
      console.log(`Database connection attempt ${attempts} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
    }
  }
  return false;
}

export async function createListing(data: CreateListingData) {
  try {
    if (!data.userId || typeof data.userId !== 'string') {
      return { error: 'Please sign in to create a listing.' };
    }

    // First ensure we can connect to the database
    const isConnected = await waitForDatabase();
    if (!isConnected) {
      return { error: 'Unable to connect to the database. Please try again in a moment.' };
    }

    console.log('Creating listing with userId:', data.userId);
    
    // Add retry logic for database operations
    let retries = 3;
    let listing: any;
    
    while (retries > 0) {
      try {
        listing = await db.listing.create({
          data: {
            name: data.listingName,
            footage: data.footage,
            bathroomCount: data.bathroomCount,
            bedroomCount: data.bedroomCount,
            location: data.location,
            latitude: data.latitude,
            longitude: data.longitude,
            description: data.description,
            propertyType: data.propertyType,
            price: data.price,
            facilities: data.facilities,
            userId: data.userId,
            images: {
              create: data.images.map((url, index) => ({
                url,
                order: index
              }))
            }
          }
        });
        break; // Success - exit retry loop
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          console.error('All retries failed:', dbError);
          throw dbError;
        }
        console.log(`Database operation failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    // Ensure listing was created before proceeding
    if (!listing) {
      console.error('Listing was not created.');
      return { error: 'Failed to create listing.' };
    }

    // Calculate and store nearby amenities
    try {
      await calculateAndStoreAmenities(listing.id, data.latitude, data.longitude);
    } catch (error) {
      console.error('Failed to calculate amenities:', error);
      // Don't fail the listing creation if amenities calculation fails
    }
    return { success: true, listing };
  } catch (error) {
    console.error('Error creating listing:', error);
    return { error: 'Failed to create listing' };
  }
}