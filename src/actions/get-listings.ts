'use server'

import { db } from "@/db";

export interface ListingWithImages {
  id: string;
  name: string;
  footage: number;
  bathroomCount: number;
  bedroomCount: number;
  location: string;
  description: string;
  images: {
    url: string;
    order: number;
  }[];
}

export async function getListings() {
  try {
    const listings = await db.listing.findMany({
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, listings };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { error: 'Failed to fetch listings' };
  }
}

export async function getRelatedListings(listingId: string, limit = 4) {
  try {
    // First get the current listing to get its location and features
    const currentListing = await db.listing.findUnique({
      where: { id: listingId },
      select: {
        location: true,
        bedroomCount: true,
        bathroomCount: true,
        footage: true,
      }
    });

    if (!currentListing) {
      throw new Error('Listing not found');
    }

    // Then find similar listings based on location and features
    const relatedListings = await db.listing.findMany({
      where: {
        AND: [
          { id: { not: listingId } }, // Exclude current listing
          {
            OR: [
              { location: currentListing.location }, // Same location
              {
                AND: [
                  { bedroomCount: { gte: currentListing.bedroomCount - 1, lte: currentListing.bedroomCount + 1 } },
                  { bathroomCount: { gte: currentListing.bathroomCount - 1, lte: currentListing.bathroomCount + 1 } },
                  { footage: { gte: currentListing.footage * 0.7, lte: currentListing.footage * 1.3 } }, // Within 30% of the footage
                ]
              }
            ]
          }
        ]
      },
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, listings: relatedListings };
  } catch (error) {
    console.error('Error fetching related listings:', error);
    return { error: 'Failed to fetch related listings' };
  }
}